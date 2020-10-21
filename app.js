const express = require('express');
const knex = require('knex');

const sports = require('./src/controllers/sports');
const odds = require('./src/controllers/odds');
const cron = require('./src/controllers/cron');

const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI,
});

const app = express();

app.listen(3000, async () => {
  console.log('app is running on port 3000');
  await sports.getSports(db);
  await odds.getOdds(db);
  await cron.scheduleCron(db);
});
