-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  monthly_income numeric default 0,
  savings_goal_pct numeric default 20,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text,
  amount numeric not null,
  type text not null, -- 'income' or 'expense'
  category text,
  subcategory text,
  emoji text,
  date timestamp with time zone not null,
  ai_confidence numeric,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for transactions
alter table transactions enable row level security;

create policy "Users can view their own transactions." on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions." on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions." on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions." on transactions
  for delete using (auth.uid() = user_id);

-- Create a trigger to automatically create a profile when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, monthly_income, savings_goal_pct)
  values (new.id, new.raw_user_meta_data->>'name', 0, 20);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
