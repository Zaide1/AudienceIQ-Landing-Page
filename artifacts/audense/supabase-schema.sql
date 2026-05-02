-- ============================================================
-- Audense — Supabase Schema + RLS
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

-- ── 1. profiles ─────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. research_sessions ────────────────────────────────────
create table if not exists public.research_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  product_summary text,
  category        text,
  region          text,
  onboarding_data jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.research_sessions enable row level security;

create policy "Users can view own sessions"
  on public.research_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.research_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.research_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.research_sessions for delete
  using (auth.uid() = user_id);


-- ── 3. audience_maps ────────────────────────────────────────
create table if not exists public.audience_maps (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.research_sessions(id) on delete cascade,
  audience_map_json jsonb not null,
  source_mode       text default 'ai_hypothesis',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (session_id)
);

alter table public.audience_maps enable row level security;

create policy "Users can view own audience maps"
  on public.audience_maps for select
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own audience maps"
  on public.audience_maps for insert
  with check (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update own audience maps"
  on public.audience_maps for update
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own audience maps"
  on public.audience_maps for delete
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );


-- ── 4. chat_messages ────────────────────────────────────────
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'ai', 'system')),
  content    text not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view own chat messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own chat messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own chat messages"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );


-- ── 5. research_signals ─────────────────────────────────────
create table if not exists public.research_signals (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.research_sessions(id) on delete cascade,
  segment_id  text,
  source      text,
  title       text,
  url         text,
  snippet     text,
  signal_type text,
  created_at  timestamptz default now()
);

alter table public.research_signals enable row level security;

create policy "Users can view own research signals"
  on public.research_signals for select
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own research signals"
  on public.research_signals for insert
  with check (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own research signals"
  on public.research_signals for delete
  using (
    exists (
      select 1 from public.research_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );


-- ── Done ────────────────────────────────────────────────────
-- All tables have RLS enabled. Users can only read/write their own data.
