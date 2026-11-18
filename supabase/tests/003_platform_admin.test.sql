-- Database tests (pgTAP): platform administrator, role switching and the People console.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(14);

\set site '5a1e0000-0000-4000-8000-000000000001'
\set op '5a1e0000-0000-4000-8000-0000000000a1'
\set tech '5a1e0000-0000-4000-8000-0000000000a2'
\set boss '00000000-0000-4000-8000-0000000000fd'

create function pg_temp.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

-- A new account with an ordinary email gets no special rights.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', :'boss', 'authenticated', 'authenticated', 'boss@example.com', '',
  '{"full_name": "Platform Admin"}', now(), now());
select is((select is_platform_admin from public.profiles where id = :'boss'), false, 'An ordinary new account is not a platform admin');
select is(public._is_owner_email('boss@example.com'), false, 'Only the owner''s email (by hash) is recognised');

select public._grant_platform_owner(:'boss');
select is((select is_platform_admin from public.profiles where id = :'boss'), true, 'The owner grant makes the account a platform admin');
select is((select role::text from public.site_members where site_id = :'site' and user_id = :'boss'), 'admin',
  'The owner grant adds an admin membership on every site');

-- Ordinary members cannot use the console or switch roles.
select pg_temp.act_as(:'op');
select is(public.switch_my_role(:'site', 'admin'), 'not_authorised', 'An operator cannot switch their own role');
select is(public.admin_set_member_role(:'site', :'tech', 'committee'), 'not_authorised', 'An operator cannot change roles');
select is((select count(*)::int from public.admin_list_members(:'site')), 0, 'An operator sees no one in the console');
reset role;

-- The platform admin switches role for real.
select pg_temp.act_as(:'boss');
select is(public.switch_my_role(:'site', 'technician'), 'ok', 'The platform admin can switch to technician');
select is(public.site_role(:'site')::text, 'technician', 'After switching, the database treats them as a technician');
select is(public.switch_my_role(:'site', 'admin'), 'ok', 'and can switch back to admin');

-- People console
select ok((select count(*) from public.admin_list_members(:'site') where email like '%@example.com') >= 3,
  'The platform admin sees team members with their email');
select is(public.admin_set_member_role(:'site', :'tech', 'committee'), 'ok', 'The platform admin can change a member''s role');
select is(public.admin_update_profile(:'tech', '  ', 'en'), 'invalid_name', 'An empty name is rejected');
reset role;
select is((select count(*)::int from public.audit_log where entity_id = :'tech' and action = 'member_role_changed'), 1,
  'Role changes are recorded in the audit log');

select * from finish();
rollback;
