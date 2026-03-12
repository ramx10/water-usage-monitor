-- Supabase SQL schema for Water Usage Monitoring

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.water_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  liters numeric(10, 2) not null check (liters >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_water_usage_user_date on public.water_usage (user_id, date desc);

-- Helper function for admin aggregated usage per user
create or replace function public.water_usage_per_user()
returns table (
  user_id uuid,
  user_name text,
  email text,
  total_liters numeric,
  record_count bigint
)
language sql
security definer
as $$
  select
    u.id as user_id,
    u.name as user_name,
    u.email,
    coalesce(sum(w.liters), 0) as total_liters,
    count(w.id) as record_count
  from public.users u
  left join public.water_usage w
    on u.id = w.user_id
  group by u.id, u.name, u.email
  order by total_liters desc;
$$;

-- RLS policies
alter table public.users enable row level security;
alter table public.water_usage enable row level security;

create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can view their own water usage"
  on public.water_usage
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own water usage"
  on public.water_usage
  for insert
  with check (auth.uid() = user_id);

