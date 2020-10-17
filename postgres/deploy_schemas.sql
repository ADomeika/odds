-- deploy fresh database tables
\i '/docker-entrypoint-initdb.d/tables/sports.sql'
\i '/docker-entrypoint-initdb.d/tables/fixtures.sql'
\i '/docker-entrypoint-initdb.d/tables/odds.sql'
