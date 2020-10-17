const axios = require('axios');

const url = `https://api.the-odds-api.com/v3/odds/?sport=upcoming&region=uk&mkt=h2h&dateFormat=iso&apiKey=${process.env.ODDS_API_KEY}`;

const addSitesToDB = async (sites, fixture_id, db) => {
  return await Promise.all(
    sites.map(
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
            .into('sites');
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

          await addSitesToDB(sites, fixture_id, db);
        } catch (error) {
          console.error(error);
        }
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

// const updateOdds = async (db) => {
//   const {
//     data: { data },
//   } = await axios.get(url);

//   console.log('Sites updated');
// }

module.exports = {
  getOdds,
};
