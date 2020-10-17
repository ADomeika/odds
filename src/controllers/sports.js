const axios = require('axios');

const url = `https://api.the-odds-api.com/v3/sports/?all=true&apiKey=${process.env.ODDS_API_KEY}`;

const addSportsToDB = async (data, db) => {
  return await Promise.all(
    data.map(async ({ key, active, group, details, title, has_outrights }) => {
      try {
        const trx = await db.transaction();
        await trx
          .insert({
            sport_key: key,
            active,
            sport_group: group,
            details,
            title,
            has_outrights,
          })
          .into('sports');
        await trx.commit();
      } catch (error) {
        console.error(error);
      }
    })
  );
};

const getSports = async (db) => {
  const {
    data: { data },
  } = await axios.get(url);

  addSportsToDB(data, db);
  console.log('All available sports have been stored in database');
};

module.exports = {
  getSports,
};
