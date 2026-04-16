-- Insertar manualmente los 3 partidos de Curaçao (Grupo C)
-- que no se pudieron importar por encoding del nombre

insert into matches (api_match_id, phase, group_name, home_team_id, away_team_id, kickoff_at, venue, city, status)
select
  500001,
  'group',
  'C',
  (select id from teams where code = 'GER'),
  (select id from teams where code = 'CUR'),
  '2026-06-15 20:00:00+00',
  'SoFi Stadium',
  'Los Angeles',
  'scheduled'
where not exists (select 1 from matches where api_match_id = 500001);

insert into matches (api_match_id, phase, group_name, home_team_id, away_team_id, kickoff_at, venue, city, status)
select
  500002,
  'group',
  'C',
  (select id from teams where code = 'ECU'),
  (select id from teams where code = 'CUR'),
  '2026-06-19 20:00:00+00',
  'AT&T Stadium',
  'Dallas',
  'scheduled'
where not exists (select 1 from matches where api_match_id = 500002);

insert into matches (api_match_id, phase, group_name, home_team_id, away_team_id, kickoff_at, venue, city, status)
select
  500003,
  'group',
  'C',
  (select id from teams where code = 'CUR'),
  (select id from teams where code = 'CIV'),
  '2026-06-23 20:00:00+00',
  'Estadio Akron',
  'Guadalajara',
  'scheduled'
where not exists (select 1 from matches where api_match_id = 500003);
