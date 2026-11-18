-- Platform administrator (owner decision, 18 Nov 2026).
-- The owner's account holds every role and can switch between them to see and act exactly as that person would, and
-- manages team members' profiles in the People console. Additive only: one new column, functions and a trigger.
-- The owner's email never appears in this public repository: it is recognised by its SHA-256 hash.

alter table public.profiles add column is_platform_admin boolean not null default false;
comment on column public.profiles.is_platform_admin is
  'Platform administrator: may switch their own role on any site and manage team members (People console).';

-- ---------------------------------------------------------------------------------------------------------------
-- Owner recognition and grant
-- ---------------------------------------------------------------------------------------------------------------
create function public._is_owner_email(p_email text) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex')
    = 'e47065aac7c46ef39da4e41ce58e28658303da480d40048a3b7f259322ef1c46', false);
$$;

create function public._grant_platform_owner(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_site uuid;
begin
  update public.profiles set is_platform_admin = true where id = p_user;
  for v_site in select id from public.sites loop
    insert into public.site_members (site_id, user_id, role) values (v_site, p_user, 'admin')
      on conflict (site_id, user_id) do nothing;
    perform public._audit(null, 'system', v_site, 'profile', p_user, 'platform_admin_granted', '{}'::jsonb);
  end loop;
end;
$$;

create function public.handle_owner_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public._is_owner_email(new.email) then
    perform public._grant_platform_owner(new.id);
  end if;
  return new;
end;
$$;
-- Runs after on_auth_user_created (trigger names fire alphabetically), so the profile already exists.
create trigger on_auth_user_owner after insert on auth.users
  for each row execute function public.handle_owner_account();

-- If the owner was invited before this migration ran.
do $$
declare
  v_user uuid;
begin
  for v_user in select u.id from auth.users u join public.profiles p on p.id = u.id where public._is_owner_email(u.email) loop
    perform public._grant_platform_owner(v_user);
  end loop;
end;
$$;

create function public._is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_platform_admin from public.profiles where id = (select auth.uid())), false);
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Role switch: the platform admin really becomes that role on the site (RLS and workflow rules follow).
-- ---------------------------------------------------------------------------------------------------------------
create function public.switch_my_role(p_site uuid, p_role public.member_role) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_old public.member_role;
begin
  if not public._is_platform_admin() then return 'not_authorised'; end if;
  if not exists (select 1 from public.sites where id = p_site) then return 'unknown_site'; end if;
  select role into v_old from public.site_members where site_id = p_site and user_id = (select auth.uid());
  insert into public.site_members (site_id, user_id, role) values (p_site, (select auth.uid()), p_role)
    on conflict (site_id, user_id) do update set role = excluded.role;
  perform public._audit((select auth.uid()), 'web', p_site, 'profile', (select auth.uid()), 'role_switched',
    jsonb_build_object('from', v_old, 'to', p_role));
  return 'ok';
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- People console
-- ---------------------------------------------------------------------------------------------------------------
create function public.admin_list_members(p_site uuid)
returns table (user_id uuid, full_name text, email text, role public.member_role, last_sign_in_at timestamptz,
               phone_masked text, is_platform_admin boolean)
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.full_name, u.email::text, m.role, u.last_sign_in_at, public.mask_phone(p.phone_e164), p.is_platform_admin
  from public.site_members m
  join public.profiles p on p.id = m.user_id
  join auth.users u on u.id = m.user_id
  where m.site_id = p_site and public._is_platform_admin()
  order by p.full_name;
$$;

create function public.admin_set_member_role(p_site uuid, p_user uuid, p_role public.member_role) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_old public.member_role;
begin
  if not public._is_platform_admin() then return 'not_authorised'; end if;
  select role into v_old from public.site_members where site_id = p_site and user_id = p_user;
  if v_old is null then return 'not_a_member'; end if;
  update public.site_members set role = p_role where site_id = p_site and user_id = p_user;
  perform public._audit((select auth.uid()), 'web', p_site, 'profile', p_user, 'member_role_changed',
    jsonb_build_object('from', v_old, 'to', p_role));
  return 'ok';
end;
$$;

create function public.admin_update_profile(p_user uuid, p_full_name text, p_locale text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_site uuid;
begin
  if not public._is_platform_admin() then return 'not_authorised'; end if;
  if length(trim(coalesce(p_full_name, ''))) not between 1 and 120 then return 'invalid_name'; end if;
  if p_locale not in ('en', 'sw') then return 'invalid_locale'; end if;
  update public.profiles set full_name = trim(p_full_name), locale = p_locale where id = p_user;
  if not found then return 'not_found'; end if;
  for v_site in select site_id from public.site_members where user_id = p_user loop
    perform public._audit((select auth.uid()), 'web', v_site, 'profile', p_user, 'profile_updated',
      jsonb_build_object('full_name', trim(p_full_name), 'locale', p_locale));
  end loop;
  return 'ok';
end;
$$;

revoke execute on function public._is_owner_email(text), public._grant_platform_owner(uuid), public.handle_owner_account(),
  public._is_platform_admin() from public, anon, authenticated;
grant execute on function public.switch_my_role(uuid, public.member_role), public.admin_list_members(uuid),
  public.admin_set_member_role(uuid, uuid, public.member_role), public.admin_update_profile(uuid, text, text) to authenticated;

grant select (is_platform_admin) on public.profiles to authenticated;

-- Role changes appear live in the shell and the console (rows are still filtered by RLS).
alter publication supabase_realtime add table public.site_members;
