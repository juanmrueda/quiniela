-- ─────────────────────────────────────────
-- QUINIELA MUNDIAL FIFA 2026 — Schema v1
-- ─────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ENUMs
create type user_role as enum ('user', 'admin', 'super_admin');
create type match_phase as enum (
  'group', 'round_of_32', 'round_of_16',
  'quarterfinal', 'semifinal', 'third_place', 'final'
);
create type match_status as enum ('scheduled', 'live', 'finished', 'cancelled');
create type notif_type as enum (
  'reminder_24h', 'reminder_1h', 'match_locked',
  'match_result', 'ranking_change', 'picks_reminder',
  'knockout_unlocked', 'custom'
);

-- ─────────────────────────────────────────
-- profiles (extiende auth.users)
-- ─────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  company     text,
  role        user_role default 'user' not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as
$func$
begin
  insert into profiles (id, email, full_name, avatar_url, company)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    split_part(new.email, '@', 2)
  );
  return new;
end;
$func$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────
-- teams (48 selecciones)
-- ─────────────────────────────────────────
create table teams (
  id            serial primary key,
  name          text not null,
  name_es       text not null,
  code          char(3) not null unique,
  flag_url      text,
  group_name    char(1),
  confederation text,
  created_at    timestamptz default now() not null
);

-- ─────────────────────────────────────────
-- matches (104 partidos)
-- ─────────────────────────────────────────
create table matches (
  id            serial primary key,
  api_match_id  integer unique,
  phase         match_phase not null,
  group_name    char(1),
  match_number  integer,
  home_team_id  integer references teams(id),
  away_team_id  integer references teams(id),
  kickoff_at    timestamptz not null,
  venue         text,
  city          text,
  home_score    smallint,
  away_score    smallint,
  status        match_status default 'scheduled' not null,
  lock_at       timestamptz,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create or replace function set_match_lock_at()
returns trigger language plpgsql as
$func$
begin
  new.lock_at = new.kickoff_at - interval '5 minutes';
  return new;
end;
$func$;

create trigger match_lock_at_trigger
  before insert or update of kickoff_at on matches
  for each row execute procedure set_match_lock_at();

-- ─────────────────────────────────────────
-- predictions
-- ─────────────────────────────────────────
create table predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  match_id      integer not null references matches(id),
  home_score    smallint not null,
  away_score    smallint not null,
  points_exact  smallint default 0,
  points_winner smallint default 0,
  points_goals  smallint default 0,
  points_total  smallint default 0,
  submitted_at  timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  constraint unique_user_match unique (user_id, match_id)
);

-- ─────────────────────────────────────────
-- tournament_picks (campeon/sub/3ro)
-- ─────────────────────────────────────────
create table tournament_picks (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade unique,
  champion_id      integer references teams(id),
  runner_up_id     integer references teams(id),
  third_place_id   integer references teams(id),
  locked           boolean default false not null,
  points_champion  smallint default 0,
  points_runner_up smallint default 0,
  points_third     smallint default 0,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

-- ─────────────────────────────────────────
-- notifications_log
-- ─────────────────────────────────────────
create table notifications_log (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid references profiles(id) on delete set null,
  match_id  integer references matches(id) on delete set null,
  type      notif_type not null,
  title     text not null,
  body      text not null,
  sent_at   timestamptz default now() not null,
  status    text default 'sent'
);

-- ─────────────────────────────────────────
-- leaderboard view
-- ─────────────────────────────────────────
create or replace view leaderboard as
select
  p.id                                                                    as user_id,
  p.full_name,
  p.email,
  p.avatar_url,
  p.company,
  coalesce(sum(pr.points_total), 0)                                       as match_points,
  coalesce(sum(case when m.phase = 'group' then pr.points_total else 0 end), 0) as group_points,
  coalesce(tp.points_champion, 0) +
    coalesce(tp.points_runner_up, 0) +
    coalesce(tp.points_third, 0)                                          as pick_points,
  coalesce(sum(pr.points_total), 0) +
    coalesce(tp.points_champion, 0) +
    coalesce(tp.points_runner_up, 0) +
    coalesce(tp.points_third, 0)                                          as total_points,
  coalesce(tp.champion_id, 0)                                             as tiebreak_champion,
  coalesce(tp.runner_up_id, 0)                                            as tiebreak_runner_up,
  coalesce(tp.third_place_id, 0)                                          as tiebreak_third
from profiles p
left join predictions pr on pr.user_id = p.id
left join matches m on m.id = pr.match_id
left join tournament_picks tp on tp.user_id = p.id
where p.role = 'user'
group by
  p.id, p.full_name, p.email, p.avatar_url, p.company,
  tp.points_champion, tp.points_runner_up, tp.points_third,
  tp.champion_id, tp.runner_up_id, tp.third_place_id;

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table profiles          enable row level security;
alter table teams             enable row level security;
alter table matches           enable row level security;
alter table predictions       enable row level security;
alter table tournament_picks  enable row level security;
alter table notifications_log enable row level security;

create policy "profiles_select"     on profiles         for select using (true);
create policy "profiles_update"     on profiles         for update using (auth.uid() = id);
create policy "teams_select"        on teams            for select using (auth.role() = 'authenticated');
create policy "matches_select"      on matches          for select using (auth.role() = 'authenticated');
create policy "predictions_select"  on predictions      for select using (auth.uid() = user_id);
create policy "predictions_insert"  on predictions      for insert with check (auth.uid() = user_id);
create policy "predictions_update"  on predictions      for update using (auth.uid() = user_id);
create policy "picks_select"        on tournament_picks for select using (auth.uid() = user_id);
create policy "picks_insert"        on tournament_picks for insert with check (auth.uid() = user_id);
create policy "picks_update"        on tournament_picks for update using (auth.uid() = user_id);
create policy "notif_select"        on notifications_log for select using (auth.uid() = user_id);

-- Indices
create index idx_predictions_user  on predictions(user_id);
create index idx_predictions_match on predictions(match_id);
create index idx_matches_kickoff   on matches(kickoff_at);
create index idx_matches_phase     on matches(phase);
create index idx_matches_status    on matches(status);
