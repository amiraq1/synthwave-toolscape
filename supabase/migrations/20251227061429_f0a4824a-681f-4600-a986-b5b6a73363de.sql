-- =========================================
-- A) تأمين profiles: "مالك فقط" + إزالة email
-- =========================================

-- تأكد أن RLS مفعّل
alter table public.profiles enable row level security;

-- احذف سياسة القراءة العامة الخطيرة
drop policy if exists "Users can view all profiles" on public.profiles;

-- أعد إنشاء سياسات المالك فقط (نحذف القديمة لتجنب التكرار)
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Profiles: owner can read"
on public.profiles
for select
using (auth.uid() = id);

create policy "Profiles: owner can insert"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Profiles: owner can update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================
-- B) إنشاء جدول خاص للبريد (Private)
-- =========================================

create table if not exists public.private_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.private_profiles enable row level security;

-- سياسات خاصة بالمالك فقط
drop policy if exists "Private: owner can read" on public.private_profiles;
drop policy if exists "Private: owner can insert" on public.private_profiles;
drop policy if exists "Private: owner can update" on public.private_profiles;

create policy "Private: owner can read"
on public.private_profiles
for select
using (auth.uid() = id);

create policy "Private: owner can insert"
on public.private_profiles
for insert
with check (auth.uid() = id);

create policy "Private: owner can update"
on public.private_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================
-- C) ترحيل الإيميلات القديمة من profiles -> private_profiles
-- (نفّذ هذا قبل حذف عمود email)
-- =========================================

insert into public.private_profiles (id, email)
select id, email
from public.profiles
where email is not null
on conflict (id) do update set email = excluded.email;

-- الآن احذف email من profiles نهائياً
alter table public.profiles drop column if exists email;

-- =========================================
-- D) تحديث trigger function لتعبئة الجداول الجديدة
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- profiles: بيانات غير حساسة فقط
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  -- private_profiles: email (حساس)
  insert into public.private_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;