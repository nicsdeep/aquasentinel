-- Database tests (pgTAP): problem reporting, routine checks and honest SMS delivery status.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(12);

\set site '5a1e0000-0000-4000-8000-000000000001'
\set op '5a1e0000-0000-4000-8000-0000000000a1'
\set tech '5a1e0000-0000-4000-8000-0000000000a2'
\set com '5a1e0000-0000-4000-8000-0000000000a3'

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-0000000000fe', 'authenticated',
  'authenticated', 'stranger@example.com', '', '{"full_name": "Stranger"}', now(), now());

create function pg_temp.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

-- Problem reporting -------------------------------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-8000-0000000000fe');
select is(public.report_problem(:'site', 'leak', 'Water on the road') ->> 'error', 'not_authorised',
  'People who are not members of the site cannot report problems on it');
reset role;

select pg_temp.act_as(:'op');
select is(public.report_problem(:'site', 'flood', 'x') ->> 'error', 'unknown_category', 'Unknown categories are rejected');
select is(public.report_problem(:'site', 'leak', 'Water pooling near the river crossing') ->> 'result', 'created',
  'A member can report a problem and it becomes an incident');
reset role;

select is((select status::text from public.incidents where title = 'Leak or burst pipe'), 'open', 'The reported incident is open');
select is((select evidence ->> 'reported_by' from public.incidents where title = 'Leak or burst pipe'), 'Mwende Musyoka',
  'The incident records who reported it');
select ok((select count(*) from public.sms_messages s join public.incidents i on i.id = s.incident_id
  where i.title = 'Leak or burst pipe' and s.direction = 'outbound') >= 2, 'The team is notified by SMS');

select pg_temp.act_as(:'tech');
select is(public.report_problem(:'site', 'leak', 'Saw it too') ->> 'result', 'added_to_existing',
  'A repeat report is added to the open incident instead of creating a duplicate');
reset role;
select is((select count(*) from public.incidents where title = 'Leak or burst pipe')::int, 1, 'Still exactly one leak incident');

-- The rule engine never opens or recovers person-reported incidents from telemetry.
select public._evaluate_rules(:'site');
select is((select status::text from public.incidents where title = 'Leak or burst pipe'), 'open',
  'Telemetry does not touch person-reported incidents');

-- Routine checks ----------------------------------------------------------------------------------------------------
select pg_temp.act_as(:'tech');
select is(public.log_routine_check(:'site', '[{"item":"Intake screen clear","ok":true},{"item":"No leaks","ok":false}]', 'Small drip at valve'),
  'ok', 'A technician can log the daily routine check');
reset role;
select is((select (details ->> 'issues')::int from public.audit_log where action = 'routine_check' order by id desc limit 1), 1,
  'The routine check records how many items need attention');

-- Honest SMS status: demo messages are "sent", never "delivered" without provider confirmation.
select is((select count(*) from public.sms_messages where is_simulated and status = 'delivered'
  and created_at > now() - interval '1 minute')::int, 0, 'Demo SMS are never marked delivered');

select * from finish();
rollback;
