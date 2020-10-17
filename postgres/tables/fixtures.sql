BEGIN TRANSACTION;

CREATE TABLE fixtures (
  id SERIAL PRIMARY KEY,
  sport_key text NOT NULL,
  sport_nice text NOT NULL,
  team1 text NOT NULL,
  team2 text NOT NULL,
  home_team text NOT NULL,
  commence_time TIMESTAMP NOT NULL
);

COMMIT;