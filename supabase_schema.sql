-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- It creates the three tables Lingo needs and enables Row Level Security.

-- ── profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  username   text unique,
  email      text,
  avatar     text,
  xp         integer not null default 0,
  level      integer not null default 1,
  streak     integer not null default 1,
  last_login timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Allow username lookup during sign-in (unauthenticated read of email by username)
create policy "Anyone can look up email by username"
  on public.profiles for select
  using (true);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Learner'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration: add username column if upgrading from earlier schema
alter table public.profiles add column if not exists username text unique;


-- ── progress ──────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id      uuid references public.profiles(id) on delete cascade,
  lesson_id    text not null,
  completed_at timestamptz default now(),
  score        integer,
  primary key (user_id, lesson_id)
);

alter table public.progress enable row level security;

create policy "Users can manage their own progress"
  on public.progress for all
  using (auth.uid() = user_id);


-- ── vocabulary ────────────────────────────────────────────────────────────
create table if not exists public.vocabulary (
  user_id     uuid references public.profiles(id) on delete cascade,
  word        text not null,
  strength    real not null default 0.1,
  next_review timestamptz default now(),
  interval    integer not null default 1,
  ease_factor real not null default 2.5,
  primary key (user_id, word)
);

alter table public.vocabulary enable row level security;

create policy "Users can manage their own vocabulary"
  on public.vocabulary for all
  using (auth.uid() = user_id);


-- ── increment_xp RPC ──────────────────────────────────────────────────────
create or replace function increment_xp(uid uuid, amount integer)
returns void language sql security definer as $$
  update profiles set xp = xp + amount where id = uid;
$$;
