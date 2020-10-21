const axios = require('axios');
const cron = require('node-cron');

const { addFixturesToDB, addOddsToDB } = require('./odds');

const url = `https://api.the-odds-api.com/v3/odds`;
const params = {
  region: 'uk',
  mkt: 'h2h',
  dateFormat: 'iso',
  apiKey: process.env.ODDS_API_KEY,
};

const getSports = async (db) => {
  try {
    const sports = await db.select('sport_key').from('sports');
    return sports;
  } catch (error) {
    console.error(error);
  }
};

const addFixture = async (data, db) => {
  await addFixturesToDB(data, db);
};

const editOdds = async (odds, fixture_id, db) => {
  await db('odds').where({ fixture_id }).del();
  await addOddsToDB(odds, fixture_id, db);
};

const editFixtures = async (data, db) => {
  return await Promise.all(
    data.map(
      async ({
        sport_key,
        teams: [team1, team2],
        home_team,
        sport_nice,
        commence_time,
        sites,
      }) => {
        try {
          const [id] = await db('fixtures')
            .where({ sport_key, team1, team2, home_team })
            .returning('id')
            .update({
              commence_time,
            });
          console.log(id);

          await editOdds(sites, id, db);
        } catch (error) {
          addFixture(
            [
              {
                sport_key,
                sport_nice,
                teams: [team1, team2],
                home_team,
                commence_time,
                sites,
              },
            ],
            db
          );
        }
      }
    )
  );
};

const scheduleCron = async (db) => {
  const sports = await getSports(db);

  cron.schedule('* 0-23 * * *', async () => {
    await Promise.all(
      sports.map(async ({ sport_key: sport }) => {
        try {
          const {
            data: { data },
          } = await axios.get(url, {
            params: {
              ...params,
              sport,
            },
          });

          await editFixtures(data, db);
        } catch (error) {
          console.error(error);
        }
      })
    );
    console.log('Done CRON job');
  });
};

module.exports = {
  scheduleCron,
};
