create extension if not exists pgcrypto;
create type public.social_platform as enum ('x','tiktok','instagram');
create table public.users (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 organization_name text not null default '',
 created_at timestamptz not null default now()
);
create table public.competitors (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 name text not null,
 keywords_tracked text[] not null default '{}',
 created_at timestamptz not null default now(),
 unique(user_id,name)
);
create table public.leads (
 id uuid primary key default gen_random_uuid(),
 competitor_id uuid not null references public.competitors(id) on delete cascade,
 social_platform public.social_platform not null,
 source_handle text not null,
 post_url text not null,
 content_text text not null,
 intent_score double precision not null check(intent_score between 0 and 1),
 processed_at timestamptz not null default now(),
 is_unlocked boolean not null default false
);
create table public.lead_unlocks (
 user_id uuid not null references public.users(id) on delete cascade,
 lead_id uuid not null references public.leads(id) on delete cascade,
 unlocked_at timestamptz not null default now(),
 primary key(user_id,lead_id)
);
alter table public.lead_unlocks enable row level security;
create policy "users read own lead unlocks" on public.lead_unlocks for select using(user_id=auth.uid());

create table public.lead_alerts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 lead_ids uuid[] not null default '{}',
 created_at timestamptz not null default now(),
 acknowledged_at timestamptz
);
create index lead_alerts_user_created_idx on public.lead_alerts(user_id,created_at desc);
alter table public.lead_alerts enable row level security;
create policy "users read own lead alerts" on public.lead_alerts for select using(user_id=auth.uid());

create table public.subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 status text not null default 'inactive' check(status in ('active','trialing','past_due','canceled','inactive')),
 stripe_price_id text,
 current_period_end timestamptz,
 created_at timestamptz not null default now(),
 unique(user_id)
);
create index competitors_user_idx on public.competitors(user_id);
create index leads_competitor_processed_idx on public.leads(competitor_id,processed_at desc);
create index leads_score_processed_idx on public.leads(intent_score desc,processed_at desc);
create index subscriptions_user_status_idx on public.subscriptions(user_id,status);

create or replace function public.is_premium(uid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.subscriptions s where s.user_id=uid and s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end > now()));
$$;
create or replace function public.get_leads() returns table(id uuid, competitor_id uuid, social_platform public.social_platform, source_handle text, post_url text, content_text text, intent_score double precision, processed_at timestamptz, is_unlocked boolean, competitor_name text)
language sql stable security invoker set search_path=public as $$
 select l.id,l.competitor_id,l.social_platform,
 case when l.is_unlocked or public.is_premium(auth.uid()) or exists(select 1 from public.lead_unlocks u where u.lead_id=l.id and u.user_id=auth.uid()) then l.source_handle else '••••••••' end,
 case when l.is_unlocked or public.is_premium(auth.uid()) or exists(select 1 from public.lead_unlocks u where u.lead_id=l.id and u.user_id=auth.uid()) then l.post_url else '' end,
 l.content_text,l.intent_score,l.processed_at,(l.is_unlocked or public.is_premium(auth.uid()) or exists(select 1 from public.lead_unlocks u where u.lead_id=l.id and u.user_id=auth.uid())),c.name
 from public.leads l join public.competitors c on c.id=l.competitor_id where c.user_id=auth.uid() order by l.processed_at desc;
$$;

alter table public.users enable row level security;
alter table public.competitors enable row level security;
alter table public.leads enable row level security;
alter table public.subscriptions enable row level security;
create policy "users read own profile" on public.users for select using(id=auth.uid());
create policy "users insert own profile" on public.users for insert with check(id=auth.uid());
create policy "users update own profile" on public.users for update using(id=auth.uid()) with check(id=auth.uid());
create policy "own competitors select" on public.competitors for select using(user_id=auth.uid());
create policy "own competitors insert" on public.competitors for insert with check(user_id=auth.uid());
create policy "own competitors update" on public.competitors for update using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own competitors delete" on public.competitors for delete using(user_id=auth.uid());
create policy "leads visible to competitor owners" on public.leads for select using(exists(select 1 from public.competitors c where c.id=competitor_id and c.user_id=auth.uid()));
create policy "subscriptions read own" on public.subscriptions for select using(user_id=auth.uid());
-- Writes to subscriptions and lead ingestion are service-role-only; never expose service keys to browsers.
revoke all on function public.get_leads() from public;
grant execute on function public.get_leads() to authenticated;
-- Create profile rows on sign-up.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.users(id,email) values(new.id,coalesce(new.email,'')) on conflict(id) do update set email=excluded.email; return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
