-- Database tests (pgTAP): access control, ingestion safety, rules and the incident lifecycle.
-- Run locally with `npx supabase test db`; CI runs them on every pull request.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(32);

-- Fixtures --------------------------------------------------------------------------------------------------------
\set site '5a1e0000-0000-4000-8000-000000000001'
\set op '5a1e0000-0000-4000-8000-0000000000a1'
\set tech '5a1e0000-0000-4000-8000-0000000000a2'
\set com '5a1e0000-0000-4000-8000-0000000000a3'

-- An outsider with an account but no site membership.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-0000000000ff', 'authenticated',
  'authenticated', 'outsider@example.com', '', '{"full_name": "Outsider"}', now(), now());

-- A field site with its own device (known key) to test real ingestion.
insert into public.sites (id, name, location) values ('00000000-0000-4000-8000-00000000f001', 'Field test site', 'Test');
insert into public.devices (id, site_id, name, key_hash, key_hint)
values ('00000000-0000-4000-8000-00000000d001', '00000000-0000-4000-8000-00000000f001', 'Test unit',
  encode(extensions.digest('test-device-key-0123456789abcdef0123456789', 'sha256'), 'hex'), 'test');
insert into public.alert_rules (site_id, name, name_sw, explanation, metric, condition, threshold, sustain_minutes,
  severity, suspected_cause, recommended_action, problem_reference)
values ('00000000-0000-4000-8000-00000000f001', 'No flow', 'Hakuna maji', 'x', 'flow_rate', 'pump_on_no_flow', 0.5, 10,
  'needs_attention', 'Suspected fault', 'Inspect', 'test');

create function pg_temp.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;

-- 1. Row Level Security ---------------------------------------------------------------------------------------------
select pg_temp.act_as('00000000-0000-4000-8000-0000000000ff');
select is((select count(*) from public.sites)::int, 0, 'Outsider sees no sites');
select is((select count(*) from public.readings)::int, 0, 'Outsider sees no readings');
select is((select count(*) from public.incidents)::int, 0, 'Outsider sees no incidents');
select is((select count(*) from public.site_status)::int, 0, 'Outsider sees no site status (view respects RLS)');
reset role;

select pg_temp.act_as(:'op');
select is((select count(*) from public.sites)::int, 1, 'Operator sees only their own site');
select ok((select count(*) from public.readings) > 100, 'Operator sees the simulated history of their site');
select throws_ok($$ insert into public.incidents (reference, site_id, rule_id, title, severity, detected_at)
  select 'X', site_id, id, 'x', 'warning', now() from public.alert_rules limit 1 $$, '42501', null,
  'Users cannot write incidents directly');
select throws_ok($$ update public.readings set value = 0 $$, '42501', null, 'Users cannot alter readings');
select throws_ok($$ select phone_e164 from public.profiles $$, '42501', null, 'Phone numbers are not readable through the API');
select throws_ok($$ select key_hash from public.devices $$, '42501', null, 'Device key hashes are not readable through the API');
reset role;

set local role anon;
select throws_ok($$ select * from public.sites $$, '42501', null, 'Anonymous visitors cannot read data');
reset role;

-- 2. Ingestion ------------------------------------------------------------------------------------------------------
select is(public.ingest_readings('wrong-key-wrong-key-wrong-key-wrong-key', 1, now(), '[{"metric":"flow_rate","value":1}]') ->> 'error',
  'device_not_authorised', 'Unknown device keys are rejected');
select is(public.ingest_readings('test-device-key-0123456789abcdef0123456789', 1, now() + interval '1 hour',
  '[{"metric":"flow_rate","value":1}]') ->> 'error', 'timestamp_in_future', 'Readings from the future are rejected');
select is((public.ingest_readings('test-device-key-0123456789abcdef0123456789', 1, now() - interval '12 minutes',
  '[{"metric":"pump_running","value":1},{"metric":"flow_rate","value":0.1}]') ->> 'accepted')::int, 2,
  'Valid readings are accepted');
select is((public.ingest_readings('test-device-key-0123456789abcdef0123456789', 1, now() - interval '12 minutes',
  '[{"metric":"pump_running","value":1},{"metric":"flow_rate","value":0.1}]') ->> 'duplicates')::int, 2,
  'A retried message is not stored twice (idempotent)');
select is(jsonb_array_length(public.ingest_readings('test-device-key-0123456789abcdef0123456789', 2, now() - interval '11 minutes',
  '[{"metric":"tank_level","value":140}]') -> 'rejected'), 1, 'Implausible values are rejected');
select is((select unit from public.readings where device_id = '00000000-0000-4000-8000-00000000d001' and metric = 'flow_rate' limit 1),
  'm³/h', 'Readings are stored with their unit');

-- 3. Rules: a sustained condition opens exactly one incident, marked as suspected cause --------------------------------
select public.ingest_readings('test-device-key-0123456789abcdef0123456789', 3, now() - interval '6 minutes',
  '[{"metric":"pump_running","value":1},{"metric":"flow_rate","value":0.0}]');
select is((select count(*) from public.incidents where site_id = '00000000-0000-4000-8000-00000000f001')::int, 0,
  'No incident before the condition has lasted the full window');
select public.ingest_readings('test-device-key-0123456789abcdef0123456789', 4, now(),
  '[{"metric":"pump_running","value":1},{"metric":"flow_rate","value":0.0}]');
select public.ingest_readings('test-device-key-0123456789abcdef0123456789', 5, now(),
  '[{"metric":"pump_running","value":1},{"metric":"flow_rate","value":0.0}]');
select is((select count(*) from public.incidents where site_id = '00000000-0000-4000-8000-00000000f001')::int, 1,
  'A sustained fault opens exactly one incident');
select is((select evidence ->> 'suspected_cause' from public.incidents where site_id = '00000000-0000-4000-8000-00000000f001'),
  'Suspected fault', 'The incident states a suspected cause, not a confirmed diagnosis');

-- 4. Incident lifecycle on the demo site (web + SMS share one state) ------------------------------------------------
select pg_temp.act_as(:'com');
select is(public.demo_simulate(:'site', 'pump_fault') ->> 'ok', 'true', 'Committee can inject a SIMULATED fault');
reset role;
select is((select status::text from public.incidents where site_id = :'site'), 'open', 'Simulated fault opens an incident');
select is((select count(*) from public.sms_messages where site_id = :'site' and direction = 'outbound')::int, 3,
  'Operator, technician and committee are notified by SMS');
select ok((select bool_and(body like '%Jibu 1 Kupokea%') from public.sms_messages s join public.profiles p on p.id = s.profile_id
  where s.site_id = :'site' and p.locale = 'sw'), 'Kiswahili users get their alert SMS in Kiswahili');

select pg_temp.act_as(:'op');
select is(public.demo_simulate(:'site', 'pump_fault') ->> 'error', 'not_authorised', 'Operators cannot use demo controls');
select is(public.sms_simulate_reply('1') ->> 'result', 'ok', 'SMS reply 1 acknowledges');
select is(public.sms_simulate_reply('3') ->> 'result', 'recovery_not_verified', 'SMS cannot close before recovery is verified');
reset role;

select pg_temp.act_as(:'tech');
select is(public.incident_close((select id from public.incidents where site_id = :'site'), 'fault_repaired', 'x'),
  'not_authorised', 'Technicians cannot close incidents');
select is(public.incident_assign((select id from public.incidents where site_id = :'site'), :'tech'), 'ok',
  'Technician can take the incident');
reset role;

select pg_temp.act_as(:'com');
select public.demo_simulate(:'site', 'recovery');
reset role;
select is((select status::text from public.incidents where site_id = :'site'), 'recovered', 'Restored flow verifies recovery from telemetry');

select pg_temp.act_as(:'op');
select is(public.incident_close((select id from public.incidents where site_id = :'site'), 'fault_repaired', 'Intake cleaned'),
  'ok', 'Operator closes the recovered incident with a reason');
reset role;
select is((select count(*) from public.incident_timeline where incident_id = (select id from public.incidents where site_id = :'site'))::int,
  6, 'Every step is in the audit timeline (detected, notified, acknowledged, assigned, recovered, closed)');

select * from finish();
rollback;
