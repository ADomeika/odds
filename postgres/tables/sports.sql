BEGIN TRANSACTION;

CREATE TABLE sports (
  sport_key text PRIMARY KEY,
  active BOOLEAN NOT NULL,
  sport_group text NOT NULL,
  details text NOT NULL,
  title text NOT NULL,
  has_outrights BOOLEAN NOT NULL
);

COMMIT;