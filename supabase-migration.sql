-- GantMBA database schema
-- Run this in your Supabase SQL Editor

create table if not exists semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references semesters(id) on delete cascade,
  name text not null,
  deadline date not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (open read/write — single shared link app)
alter table semesters enable row level security;
alter table subjects enable row level security;

create policy "public access semesters" on semesters for all using (true) with check (true);
create policy "public access subjects" on subjects for all using (true) with check (true);
