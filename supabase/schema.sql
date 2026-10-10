-- ============================================================
-- 이충길 제15회 개인전 〈나눔과 공존〉 — Supabase 테이블 설정
-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여넣고 Run 하세요.
-- (여러 번 실행해도 안전합니다)
-- ============================================================

-- 1) 작품별 좋아요: 기기(브라우저)마다 작품당 1번
create table if not exists public.likes (
  work_id    int  not null check (work_id between 1 and 30),
  client_id  text not null check (char_length(client_id) between 8 and 64),
  created_at timestamptz not null default now(),
  primary key (work_id, client_id)
);

-- 2) 작품별 댓글
create table if not exists public.comments (
  id         bigint generated always as identity primary key,
  work_id    int  not null check (work_id between 1 and 30),
  nickname   text not null check (char_length(btrim(nickname)) between 1 and 20),
  body       text not null check (char_length(btrim(body)) between 1 and 300),
  hidden     boolean not null default false,   -- true 로 바꾸면 화면에서 숨김(관리용)
  created_at timestamptz not null default now()
);
create index if not exists comments_work_idx on public.comments (work_id, created_at desc);

-- 3) 전체 방명록
create table if not exists public.guestbook (
  id         bigint generated always as identity primary key,
  nickname   text not null check (char_length(btrim(nickname)) between 1 and 20),
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists guestbook_idx on public.guestbook (created_at desc);

-- 4) 보안(RLS): 모든 표에 켜고, 방문자(anon)가 할 수 있는 일만 허용
alter table public.likes     enable row level security;
alter table public.comments  enable row level security;
alter table public.guestbook enable row level security;

drop policy if exists "comments_read"  on public.comments;
drop policy if exists "comments_write" on public.comments;
create policy "comments_read"  on public.comments  for select to anon using (hidden = false);
create policy "comments_write" on public.comments  for insert to anon with check (hidden = false);

drop policy if exists "guest_read"  on public.guestbook;
drop policy if exists "guest_write" on public.guestbook;
create policy "guest_read"  on public.guestbook for select to anon using (hidden = false);
create policy "guest_write" on public.guestbook for insert to anon with check (hidden = false);

-- likes 는 정책을 만들지 않음 → 방문자가 표를 직접 읽거나 지울 수 없고, 아래 함수로만 접근

-- 5) 좋아요 함수(누르면 켜지고, 다시 누르면 취소)
create or replace function public.toggle_like(p_work int, p_client text)
returns json language plpgsql security definer set search_path = public as $$
declare liked boolean; cnt int;
begin
  if p_work not between 1 and 30 or p_client is null or char_length(p_client) not between 8 and 64 then
    raise exception 'invalid';
  end if;
  if exists (select 1 from likes where work_id = p_work and client_id = p_client) then
    delete from likes where work_id = p_work and client_id = p_client; liked := false;
  else
    insert into likes (work_id, client_id) values (p_work, p_client); liked := true;
  end if;
  select count(*) into cnt from likes where work_id = p_work;
  return json_build_object('liked', liked, 'count', cnt);
end $$;

create or replace function public.get_like_counts()
returns table(work_id int, cnt bigint) language sql security definer set search_path = public as $$
  select work_id, count(*) from likes group by work_id;
$$;

create or replace function public.get_my_likes(p_client text)
returns table(work_id int) language sql security definer set search_path = public as $$
  select work_id from likes where client_id = p_client;
$$;

create or replace function public.get_comment_counts()
returns table(work_id int, cnt bigint) language sql security definer set search_path = public as $$
  select work_id, count(*) from comments where hidden = false group by work_id;
$$;

revoke all on function public.toggle_like(int, text)   from public;
revoke all on function public.get_like_counts()        from public;
revoke all on function public.get_my_likes(text)       from public;
revoke all on function public.get_comment_counts()     from public;
grant execute on function public.toggle_like(int, text)   to anon;
grant execute on function public.get_like_counts()        to anon;
grant execute on function public.get_my_likes(text)       to anon;
grant execute on function public.get_comment_counts()     to anon;

-- 6) 표 접근 권한(필요한 만큼만)
grant usage on schema public to anon;
grant select, insert on public.comments  to anon;
grant select, insert on public.guestbook to anon;
