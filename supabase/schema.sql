-- ============================================================================
-- Vouch.School — Supabase PostgreSQL Schema
-- ============================================================================
-- Run this entire file in the Supabase SQL Editor (Project > SQL Editor).
-- It creates tables, indexes, Row Level Security (RLS) policies, and the
-- RPC functions that power the anonymous voting + viral reveal loop.
-- ============================================================================

create extension if not exists pgcrypto;

--------------------------------------------------------------------------------
-- 1. schools
--------------------------------------------------------------------------------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain_extension text,
  city text,
  student_count integer default 0,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 2. profiles — extends Supabase auth.users
--------------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  instagram_handle text,
  school_id uuid references schools(id) on delete set null,
  avatar_url text,
  vote_points integer default 0,
  grade text,
  gender text,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 3. polls — daily anonymous compliment/superlative brackets per school
--------------------------------------------------------------------------------
create table polls (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  question_text text not null,
  category text,
  active_until timestamptz not null,
  created_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- 4. votes — anonymous ballots
--------------------------------------------------------------------------------
-- NOTE: there is NO SELECT policy on this table. No role (authenticated or
-- anonymous) can ever read who cast a vote — only aggregate counts via RPCs.
--------------------------------------------------------------------------------
create table votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  voter_id uuid references profiles(id) on delete cascade,
  nominee_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  constraint one_vote_per_voter_per_poll unique (poll_id, voter_id)
);

--------------------------------------------------------------------------------
-- 5. reveals — hints unlocked by sharing to social stories
--------------------------------------------------------------------------------
create type reveal_type as enum ('gender', 'grade', 'initial');

create table reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  poll_id uuid references polls(id) on delete cascade,
  reveal_type reveal_type,
  hint_text text,
  unlocked_at timestamptz default now(),
  unique (user_id, poll_id, reveal_type)
);

--------------------------------------------------------------------------------
-- 6. shares — tracks viral story shares so hints can be unlocked
--------------------------------------------------------------------------------
create table shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  poll_id uuid references polls(id) on delete cascade,
  platform text default 'instagram_story',
  share_token text unique not null,
  shared_at timestamptz default now()
);

--------------------------------------------------------------------------------
-- Indexes for hot lookups
--------------------------------------------------------------------------------
create index idx_profiles_school_id on profiles(school_id);
create index idx_profiles_instagram_handle on profiles(instagram_handle);
create index idx_polls_school_active on polls(school_id, active_until);
create index idx_votes_poll_id on votes(poll_id);
create index idx_votes_nominee_id on votes(nominee_id);
create index idx_votes_voter_id on votes(voter_id);
create index idx_reveals_user_id on reveals(user_id);
create index idx_shares_user_poll on shares(user_id, poll_id);
create index idx_shares_token on shares(share_token);

--------------------------------------------------------------------------------
-- Row Level Security
--------------------------------------------------------------------------------
alter table schools enable row level security;
alter table profiles enable row level security;
alter table polls enable row level security;
alter table votes enable row level security;
alter table reveals enable row level security;
alter table shares enable row level security;

--------------------------------------------------------------------------------
-- Policies
--------------------------------------------------------------------------------

-- Schools: anyone (incl. unauthenticated onboarding) can browse the directory.
create policy "Schools are publicly viewable"
  on schools for select
  using (true);

-- Profiles: only schoolmates may view each other's profiles.
create policy "Profiles viewable by schoolmates"
  on profiles for select
  using (
    school_id = (
      select school_id from profiles where id = auth.uid() limit 1
    )
  );

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Polls: only schoolmates may view active polls.
create policy "Polls viewable by schoolmates"
  on polls for select
  using (
    school_id = (
      select school_id from profiles where id = auth.uid() limit 1
    )
  );

-- Votes: INSERT your own ballot only. There is deliberately no SELECT policy,
-- so raw votes are never readable — anonymity is enforced by the database.
create policy "Users can cast their own vote"
  on votes for insert
  with check (auth.uid() = voter_id);

-- Reveals: only the hint owner can read/write their unlocks.
create policy "Users can read their own reveals"
  on reveals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reveals"
  on reveals for insert
  with check (auth.uid() = user_id);

-- Shares: users own their share records.
create policy "Users can read their own shares"
  on shares for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shares"
  on shares for insert
  with check (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- Seed data: demo schools
--------------------------------------------------------------------------------
insert into schools (name, domain_extension, city, student_count) values
  ('Lincoln High School', 'lincolnhs.edu', 'Milwaukee', 1200),
  ('Roosevelt Academy', 'roosevelt.academy', 'Chicago', 950),
  ('Westside Prep', 'westsideprep.edu', 'Minneapolis', 700),
  ('Magnet STEM High', 'magnetstem.edu', 'Austin', 1400);

--------------------------------------------------------------------------------
-- Seed data: demo polls (active for 30 days)
--------------------------------------------------------------------------------
insert into polls (school_id, question_text, category, active_until)
select id, 'Most likely to build a unicorn startup?', 'Future', now() + interval '30 days' from schools;
insert into polls (school_id, question_text, category, active_until)
select id, 'Best dressed?', 'Style', now() + interval '30 days' from schools;
insert into polls (school_id, question_text, category, active_until)
select id, 'Biggest main character energy?', 'Vibe', now() + interval '30 days' from schools;
insert into polls (school_id, question_text, category, active_until)
select id, 'Most likely to be late to their own graduation?', 'Funny', now() + interval '30 days' from schools;

--------------------------------------------------------------------------------
-- RPC: cast_vote(p_poll_id, p_nominee_id) -> aggregate vote count
-- Security definer: inserts the ballot and returns ONLY the nominee's total.
--------------------------------------------------------------------------------
create or replace function cast_vote(p_poll_id uuid, p_nominee_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_voter_id uuid := auth.uid();
  v_voter_school uuid;
  v_nominee_school uuid;
  v_vote_count integer;
begin
  if v_voter_id is null then
    raise exception 'Authentication required';
  end if;

  select school_id into v_voter_school from profiles where id = v_voter_id;
  select school_id into v_nominee_school from profiles where id = p_nominee_id;

  if v_voter_school is null or v_voter_school <> v_nominee_school then
    raise exception 'You can only vote for students at your own school';
  end if;

  if not exists (
    select 1 from polls
    where id = p_poll_id
      and school_id = v_voter_school
      and active_until > now()
  ) then
    raise exception 'This poll is not active';
  end if;

  insert into votes (poll_id, voter_id, nominee_id)
  values (p_poll_id, v_voter_id, p_nominee_id)
  on conflict (poll_id, voter_id) do nothing;

  select count(*) into v_vote_count
  from votes
  where poll_id = p_poll_id and nominee_id = p_nominee_id;

  update profiles
  set vote_points = vote_points + 1
  where id = p_nominee_id;

  return v_vote_count;
end;
$$;

--------------------------------------------------------------------------------
-- RPC: create_share(p_poll_id, p_platform) -> share_token
-- Records a story share so the user becomes eligible to unlock hints.
--------------------------------------------------------------------------------
create or replace function create_share(p_poll_id uuid, p_platform text default 'instagram_story')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_token text := gen_random_uuid()::text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into shares (user_id, poll_id, platform, share_token)
  values (v_user_id, p_poll_id, p_platform, v_token)
  returning share_token into v_token;

  return v_token;
end;
$$;

--------------------------------------------------------------------------------
-- RPC: unlock_hint(p_poll_id, p_reveal_type) -> hint_text
-- Requires a share for this poll. Derives an anonymous hint from one of the
-- voters' profiles (gender / grade / initial of handle) without exposing who.
--------------------------------------------------------------------------------
create or replace function unlock_hint(p_poll_id uuid, p_reveal_type reveal_type)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_school_id uuid;
  v_hint text;
  v_share_count integer;
  v_existing integer;
  v_gender text;
  v_grade text;
  v_initial text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select school_id into v_school_id from profiles where id = v_user_id;

  select count(*) into v_share_count
  from shares
  where user_id = v_user_id and poll_id = p_poll_id;

  if v_share_count = 0 then
    raise exception 'Share to your story first to unlock this hint';
  end if;

  select count(*) into v_existing
  from reveals
  where user_id = v_user_id and poll_id = p_poll_id and reveal_type = p_reveal_type;

  if v_existing > 0 then
    select hint_text into v_hint
    from reveals
    where user_id = v_user_id and poll_id = p_poll_id and reveal_type = p_reveal_type
    limit 1;
    return v_hint;
  end if;

  -- Pick one anonymous voter and build a hint from their profile attributes.
  select p.gender, p.grade, left(coalesce(p.instagram_handle, ''), 1)
  into v_gender, v_grade, v_initial
  from votes v
  join profiles p on p.id = v.voter_id
  where v.poll_id = p_poll_id
    and v.nominee_id = v_user_id
  order by random()
  limit 1;

  v_hint := case p_reveal_type
    when 'gender' then
      'It was a ' || lower(coalesce(v_gender, 'fellow student')) || ' from your school.'
    when 'grade' then
      'It was a ' || coalesce(v_grade, 'fellow student') || ' from your school.'
    when 'initial' then
      'Their name starts with "' || coalesce(upper(v_initial), '?') || '".'
    else
      'Someone from your school voted for you.'
  end;

  insert into reveals (user_id, poll_id, reveal_type, hint_text)
  values (v_user_id, p_poll_id, p_reveal_type, v_hint)
  returning hint_text into v_hint;

  return v_hint;
end;
$$;

--------------------------------------------------------------------------------
-- RPC: get_my_compliments() -> feed of compliments received by the user
-- Only aggregate counts + hints are exposed — never voter identities.
--------------------------------------------------------------------------------
create or replace function get_my_compliments()
returns table (
  poll_id uuid,
  question_text text,
  category text,
  vote_count integer,
  hint_text text,
  unlocked boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    p.id,
    p.question_text,
    p.category,
    coalesce(vc.vote_count, 0),
    r.hint_text,
    r.hint_text is not null
  from polls p
  join lateral (
    select count(*) as vote_count
    from votes v
    where v.poll_id = p.id and v.nominee_id = auth.uid()
  ) vc on true
  left join lateral (
    select hint_text
    from reveals r
    where r.user_id = auth.uid() and r.poll_id = p.id
    order by r.unlocked_at desc
    limit 1
  ) r on true
  where p.school_id = (select school_id from profiles where id = auth.uid() limit 1)
    and vc.vote_count > 0
  order by vc.vote_count desc, p.created_at desc;
end;
$$;

--------------------------------------------------------------------------------
-- Done. Next steps:
--  1. Copy NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from
--     Supabase Project Settings > API into .env.local
--  2. Enable Email provider in Supabase Dashboard > Authentication > Providers
--  3. Deploy to Vercel, then visit / and create your first profile
--------------------------------------------------------------------------------
