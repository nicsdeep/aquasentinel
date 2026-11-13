-- SIMULATED demonstration site for the Gate B demo (PROJECT_RULES §8, §10).
-- Every row here is labelled as simulated. It mirrors the setup described in the IFSL brief §3.2
-- (solar pumping from River Athi into a storage pan through an ageing pipeline) but is NOT field data.
--
-- Demo accounts let judges try each role. They can only see this simulated site (RLS). The shared
-- password is public on purpose and grants access to simulated data only.

do $demo$
declare
  v_site constant uuid := '5a1e0000-0000-4000-8000-000000000001';
  v_operator constant uuid := '5a1e0000-0000-4000-8000-0000000000a1';
  v_technician constant uuid := '5a1e0000-0000-4000-8000-0000000000a2';
  v_committee constant uuid := '5a1e0000-0000-4000-8000-0000000000a3';
  v_password constant text := 'AquaSentinel-Demo-2026';
  v_monitor uuid;
  u record;
begin
  -- Demo users (auth + profile via trigger). Phone numbers are fictitious and never receive real SMS.
  for u in
    select * from (values
      (v_operator, 'operator.demo@example.com', 'Mwende (Operator · demo)', '+254700000101', 'en'),
      (v_technician, 'technician.demo@example.com', 'Otieno (Technician · demo)', '+254700000102', 'sw'),
      (v_committee, 'committee.demo@example.com', 'Wanza (Water committee · demo)', '+254700000103', 'en')
    ) as t(id, email, full_name, phone, locale)
  loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change,
      phone_change_token)
    values ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object('full_name', u.full_name, 'phone_e164', u.phone, 'locale', u.locale, 'is_demo', true),
      now(), now(), '', '', '', '', '', '', '', '');
    insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
    values (u.id, u.id::text, 'email',
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), now(), now());
  end loop;

  insert into public.sites (id, name, location, timezone, description, is_simulated)
  values (v_site, 'Ngomano Community Water System', 'Ngomano, Kibwezi East, Makueni County', 'Africa/Nairobi',
    'SIMULATED demonstration site. Mirrors the setup in the IFSL brief §3.2: solar-powered pumping from River Athi '
    || 'into a storage pan through an ageing pipeline, with no elevated storage. Not live field data.', true);

  insert into public.site_members (site_id, user_id, role) values
    (v_site, v_operator, 'operator'),
    (v_site, v_technician, 'technician'),
    (v_site, v_committee, 'committee');

  insert into public.assets (site_id, kind, name, details) values
    (v_site, 'intake_pump', 'River Athi intake pump', '{"power": "solar", "note": "Existing pump (simulated configuration)"}'),
    (v_site, 'solar_power', 'Solar array and battery bank', '{"rated_kw": 2.4, "note": "Existing system (simulated configuration)"}'),
    (v_site, 'pipeline', 'Rising main: river to storage pan', '{"note": "Ageing pipeline (simulated configuration)"}'),
    (v_site, 'storage_tank', 'Storage pan', '{"note": "No elevated storage at present (IFSL brief §3.2)"}');
  insert into public.assets (site_id, kind, name, details)
  values (v_site, 'monitoring_unit', 'AquaSentinel monitoring unit MU-01', '{"note": "SIMULATED device"}')
  returning id into v_monitor;

  -- The simulated device's key is random and never stored in plain text, so no one can post to it from outside.
  insert into public.devices (site_id, asset_id, name, key_hash, key_hint, is_simulated, simulation_scenario)
  values (v_site, v_monitor, 'MU-01 (SIMULATED)',
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'), 'simulated', true, 'normal');

  insert into public.alert_rules (site_id, name, name_sw, explanation, metric, condition, threshold, sustain_minutes,
    severity, suspected_cause, recommended_action, problem_reference) values
    (v_site, 'No water flow while the pump runs', 'Hakuna maji pampu ikifanya kazi',
     'If the pump reports ON but flow stays below 0.5 m³/h for 10 minutes, an urgent incident opens.',
     'flow_rate', 'pump_on_no_flow', 0.5, 10, 'needs_attention',
     'Suspected dry-running pump, blocked intake or a broken pipe near the pump. Not confirmed until inspected.',
     'Switch the pump off to prevent damage, then inspect the intake screen and the pipe near the pump.',
     'IFSL brief §3.2: unreliable pumping systems'),
    (v_site, 'Reduced flow while the pump runs', 'Maji kidogo pampu ikifanya kazi',
     'If the pump is ON and flow stays between 0.5 and 8 m³/h for 20 minutes, a warning opens.',
     'flow_rate', 'pump_on_low_flow', 8, 20, 'warning',
     'Suspected leak or partial blockage in the ageing pipeline, or a worn pump.',
     'Walk the pipeline to look for leaks and clean the intake screen.',
     'IFSL brief §3.2: ageing pipelines and inefficient conveyance'),
    (v_site, 'Low storage level', 'Kiwango cha maji kiko chini',
     'If the storage level stays below 20 % for 15 minutes, a warning opens.',
     'tank_level', 'below', 20, 15, 'warning',
     'Demand is higher than pumping, or pumping has stopped.',
     'Check that the pump is running and tell water users about possible rationing.',
     'IFSL brief §3.2: lack of elevated water storage'),
    (v_site, 'Low solar output in daylight', 'Umeme wa jua uko chini mchana',
     'Between 09:00 and 16:00, if solar output stays below 0.4 kW for 30 minutes, a warning opens.',
     'solar_power', 'below_in_daylight', 0.4, 30, 'warning',
     'Suspected dirty or damaged panels, loose wiring or a controller fault (heavy cloud is also possible).',
     'Clean the panels and check the wiring and charge controller.',
     'IFSL brief §3.2: solar downtimes'),
    (v_site, 'Monitoring unit not reporting', 'Kifaa hakijatuma taarifa',
     'If no reading arrives for 15 minutes, the site shows Offline and a warning opens.',
     null, 'no_data', null, 15, 'warning',
     'Suspected power loss at the monitoring unit or no mobile network coverage.',
     'Check the unit''s power and signal. Readings on screen may be out of date.',
     'Project rules §5: connection lost and data freshness');

  -- 24 hours of simulated normal operation, generated through the same validation and rule pipeline.
  perform public._demo_generate_history(v_site);
end;
$demo$;
