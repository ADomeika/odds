const axios = require('axios');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URI);

const url = `https://api.the-odds-api.com/v3/odds/?sport=upcoming&region=uk&mkt=h2h&dateFormat=iso&apiKey=${process.env.ODDS_API_KEY}`;

const addOddsToDB = async (odds, fixture_id, db) => {
  return await Promise.all(
    odds.map(
      async ({
        site_key,
        site_nice,
        last_update,
        odds: {
          h2h: [team1win, team2win, draw],
        },
      }) => {
        try {
          const trx = await db.transaction();
          await trx
            .insert({
              site_key,
              site_nice,
              last_update,
              team1win,
              team2win,
              draw,
              fixture_id,
            })
            .into('odds');
          await trx.commit();
        } catch (error) {
          console.error(error);
        }
      }
    )
  );
};

const addFixturesToDB = async (data, db) => {
  return await Promise.all(
    data.map(
      async ({
        sport_key,
        sport_nice,
        teams: [team1, team2],
        home_team,
        commence_time,
        sites,
      }) => {
        redisClient.hset(
          'odds',
          `${team1}|${team2}`,
          JSON.stringify({
            sport_key,
            sport_nice,
            team1,
            team2,
            home_team,
            commence_time,
            odds: sites.map(
              ({
                site_key,
                site_nice,
                last_update,
                odds: {
                  h2h: [team1win, team2win, draw],
                },
              }) => {
                return {
                  site_key,
                  site_nice,
                  last_update,
                  team1win,
                  team2win,
                  draw,
                };
              }
            ),
          }),
          async () => {
            try {
              const trx = await db.transaction();
              const [fixture_id] = await trx
                .insert({
                  sport_key,
                  sport_nice,
                  team1,
                  team2,
                  home_team,
                  commence_time,
                })
                .into('fixtures')
                .returning('id');
              await trx.commit();

              await addOddsToDB(sites, fixture_id, db);
            } catch (error) {
              console.error(error);
            }
          }
        );
      }
    )
  );
};

const getOdds = async (db) => {
  const {
    data: { data },
  } = await axios.get(url);

  await addFixturesToDB(data, db);
  console.log('All sites and fixtures added.');
};

module.exports = {
  getOdds,
  addFixturesToDB,
  addOddsToDB,
};
