BEGIN TRANSACTION;

CREATE TABLE sites (
  id serial PRIMARY KEY,
  site_key text NOT NULL,
  site_nice text NOT NULL,
  last_update TIMESTAMP NOT NULL,
  team1win NUMERIC NOT NULL,
  team2win NUMERIC NOT NULL,
  draw NUMERIC,
  fixture_id INT NOT NULL
);

COMMIT;