create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(10,2) not null,
  category text not null,
  description text,
  date date not null,
  created_at timestamptz default now()
);

create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  amount numeric(10,2) not null,
  period text check (period in ('weekly', 'monthly', 'yearly')) not null,
  created_at timestamptz default now(),
  unique(user_id, category, period)
);

alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users own their budgets" on budgets for all using (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
