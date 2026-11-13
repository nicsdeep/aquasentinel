-- AquaSentinel workflow (Gate B): ingestion, transparent rules, one incident lifecycle for web + SMS, audit.
-- Every state change goes through these functions, so dashboard, mobile and SMS can never disagree (PROJECT_RULES §3, §7).
-- Rules flag a SUSPECTED fault; only a person records a confirmed diagnosis (PROJECT_RULES §5).

create extension if not exists pg_cron with schema pg_catalog;
create sequence public.incident_reference_seq;

-- ---------------------------------------------------------------------------------------------------------------
-- Internal helpers (not callable through the API)
-- ---------------------------------------------------------------------------------------------------------------
create function public._audit(p_actor uuid, p_channel public.action_channel, p_site uuid, p_entity text,
  p_entity_id uuid, p_action text, p_details jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor_id, channel, site_id, entity, entity_id, action, details)
  values (p_actor, p_channel, p_site, p_entity, p_entity_id, p_action, coalesce(p_details, '{}'::jsonb));
$$;

-- Plain-language evidence for an incident, in English or Kiswahili.
create function public._evidence_text(p_evidence jsonb, p_locale text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v_kind text := p_evidence ->> 'kind';
  v_minutes text := p_evidence ->> 'minutes';
  v_value text := p_evidence ->> 'value';
  v_unit text := coalesce(p_evidence ->> 'unit', '');
begin
  if p_locale = 'sw' then
    return case v_kind
      when 'pump_on_no_flow' then format('Pampu inafanya kazi lakini hakuna maji: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'pump_on_low_flow' then format('Pampu inafanya kazi, maji ni kidogo: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'below' then format('Kiwango kiko chini: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'below_in_daylight' then format('Umeme wa jua uko chini mchana: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'no_data' then format('Kifaa hakijatuma taarifa kwa dakika %s.', v_minutes)
      else '' end;
  end if;
  return case v_kind
    when 'pump_on_no_flow' then format('Pump running but no flow: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'pump_on_low_flow' then format('Pump running with reduced flow: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'below' then format('Below threshold: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'below_in_daylight' then format('Low solar output in daylight: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'no_data' then format('No data from the monitoring unit for %s min.', v_minutes)
    else '' end;
end;
$$;

-- Records an outbound SMS. Simulated sites never contact a real phone: delivery is marked as simulated.
-- Real sites are queued for the SMS provider (Gate D); success is never presumed (PROJECT_RULES §7.4).
create function public._send_sms(p_site uuid, p_incident uuid, p_profile uuid, p_body text,
  p_awaiting text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_phone text;
  v_simulated boolean;
begin
  select phone_e164 into v_phone from public.profiles where id = p_profile;
  select is_simulated into v_simulated from public.sites where id = p_site;
  insert into public.sms_messages (site_id, incident_id, profile_id, direction, phone_masked, body, status,
    awaiting_confirmation, is_simulated, delivered_at, error)
  values (p_site, p_incident, p_profile, 'outbound', public.mask_phone(v_phone), left(p_body, 480),
    case when v_phone is null then 'failed'::public.sms_status
         when v_simulated then 'delivered'::public.sms_status
         else 'queued'::public.sms_status end,
    p_awaiting, v_simulated,
    case when v_phone is not null and v_simulated then now() end,
    case when v_phone is null then 'No phone number on profile' end);
end;
$$;

create function public._incident_alert_body(p_incident uuid, p_locale text) returns text
language sql stable security definer set search_path = '' as $$
  select case when p_locale = 'sw' then
      format(E'AquaSentinel %s%s\nEneo: %s\nTahadhari: %s\n%s\nJibu 1 Kupokea, 2 Kumtuma fundi, 3 Imetatuliwa',
        i.reference, case when i.is_simulated then ' (MAJARIBIO)' else '' end, s.name, r.name_sw,
        public._evidence_text(i.evidence, 'sw'))
    else
      format(E'AquaSentinel %s%s\nSite: %s\nAlert: %s\n%s\nReply 1 Ack, 2 Assign tech, 3 Resolved',
        i.reference, case when i.is_simulated then ' (SIMULATED)' else '' end, s.name, r.name,
        public._evidence_text(i.evidence, 'en'))
    end
  from public.incidents i join public.sites s on s.id = i.site_id join public.alert_rules r on r.id = i.rule_id
  where i.id = p_incident;
$$;

-- Notifies operators and technicians (and the committee for urgent incidents) in their own language.
create function public._notify_incident(p_incident uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  m record;
begin
  select * into v_inc from public.incidents where id = p_incident;
  for m in
    select sm.user_id, p.locale from public.site_members sm join public.profiles p on p.id = sm.user_id
    where sm.site_id = v_inc.site_id
      and (sm.role in ('operator', 'technician') or (sm.role = 'committee' and v_inc.severity = 'needs_attention'))
  loop
    perform public._send_sms(v_inc.site_id, v_inc.id, m.user_id, public._incident_alert_body(v_inc.id, m.locale));
  end loop;
  perform public._audit(null, 'system', v_inc.site_id, 'incident', v_inc.id, 'notified',
    jsonb_build_object('channels', jsonb_build_array('dashboard', 'sms')));
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Rule engine: transparent, sustained-duration rules with data-coverage checks and telemetry recovery
-- ---------------------------------------------------------------------------------------------------------------
create function public._evaluate_rules(p_site uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r public.alert_rules;
  v_as_of timestamptz;
  v_tz text;
  v_from timestamptz;
  v_flow_min double precision;
  v_flow_max double precision;
  v_pump_min double precision;
  v_val_max double precision;
  v_covered boolean;
  v_triggered boolean;
  v_latest double precision;
  v_latest_pump double precision;
  v_active public.incidents;
  v_new_id uuid;
  v_unit text;
  v_metric_for_coverage public.metric;
  v_anchor timestamptz;
begin
  select timezone into v_tz from public.sites where id = p_site;
  -- Evaluate at the time of the newest reading, so buffered (late) data is judged on its own timeline.
  select max(measured_at) into v_as_of from public.readings where site_id = p_site;
  if v_as_of is null then return; end if;

  for r in select * from public.alert_rules where site_id = p_site and enabled and condition <> 'no_data' loop
    v_from := v_as_of - make_interval(mins => r.sustain_minutes);
    v_metric_for_coverage := case when r.condition in ('pump_on_no_flow', 'pump_on_low_flow') then 'flow_rate'::public.metric
                                  else r.metric end;
    -- Sustained duration: anchor on the last reading at or before the window start (at most 10 min earlier).
    -- The condition must hold on that reading and on every reading after it, so it has lasted the full window.
    select max(measured_at) into v_anchor from public.readings
      where site_id = p_site and metric = v_metric_for_coverage
      and measured_at <= v_from and measured_at > v_from - interval '10 minutes';
    v_covered := v_anchor is not null;
    v_from := coalesce(v_anchor, v_from);

    v_triggered := false;
    if r.condition in ('pump_on_no_flow', 'pump_on_low_flow') then
      select min(value), max(value) into v_flow_min, v_flow_max from public.readings
        where site_id = p_site and metric = 'flow_rate' and measured_at between v_from and v_as_of;
      select min(value) into v_pump_min from public.readings
        where site_id = p_site and metric = 'pump_running' and measured_at between v_from and v_as_of;
      if r.condition = 'pump_on_no_flow' then
        v_triggered := coalesce(v_covered, false) and v_pump_min = 1 and v_flow_max < r.threshold;
      else
        -- Reduced (not zero) flow: mutually exclusive with the no-flow rule.
        v_triggered := coalesce(v_covered, false) and v_pump_min = 1 and v_flow_max < r.threshold and v_flow_min >= 0.5;
      end if;
      v_val_max := v_flow_max;
      v_unit := 'm³/h';
    else
      select max(value), min(unit) into v_val_max, v_unit from public.readings
        where site_id = p_site and metric = r.metric and measured_at between v_from and v_as_of;
      v_triggered := coalesce(v_covered, false) and v_val_max < r.threshold;
      if r.condition = 'below_in_daylight' then
        -- The whole window must fall within 09:00-16:00 local time on the same day.
        v_triggered := v_triggered
          and (v_from at time zone v_tz)::date = (v_as_of at time zone v_tz)::date
          and (v_from at time zone v_tz)::time >= time '09:00'
          and (v_as_of at time zone v_tz)::time <= time '16:00';
      end if;
    end if;

    select * into v_active from public.incidents where rule_id = r.id and status <> 'closed';

    if v_triggered and v_active.id is null then
      insert into public.incidents (reference, site_id, rule_id, title, severity, evidence, detected_at, is_simulated)
      select 'AS-' || lpad(nextval('public.incident_reference_seq')::text, 4, '0'), p_site, r.id, r.name, r.severity,
        jsonb_build_object('kind', r.condition, 'metric', coalesce(r.metric::text, 'flow_rate'),
          'value', round(v_val_max::numeric, 1), 'unit', v_unit, 'threshold', r.threshold,
          'minutes', r.sustain_minutes, 'window_start', v_from, 'window_end', v_as_of,
          'suspected_cause', r.suspected_cause, 'recommended_action', r.recommended_action,
          'rule_explanation', r.explanation),
        v_as_of, s.is_simulated
      from public.sites s where s.id = p_site
      returning id into v_new_id;
      perform public._audit(null, 'system', p_site, 'incident', v_new_id, 'detected',
        jsonb_build_object('rule', r.name, 'suspected_cause', r.suspected_cause));
      perform public._notify_incident(v_new_id);

    elsif v_active.id is not null and v_active.status in ('open', 'acknowledged', 'assigned') then
      -- Telemetry recovery: the newest readings show the condition has cleared.
      if r.condition in ('pump_on_no_flow', 'pump_on_low_flow') then
        select value into v_latest from public.readings where site_id = p_site and metric = 'flow_rate'
          order by measured_at desc, id desc limit 1;
        select value into v_latest_pump from public.readings where site_id = p_site and metric = 'pump_running'
          order by measured_at desc, id desc limit 1;
        if v_latest_pump = 1 and v_latest >= r.threshold then
          perform public._mark_recovered(v_active.id, 'telemetry', null, 'system',
            format('Flow restored: %s m³/h', round(v_latest::numeric, 1)));
        end if;
      else
        select value into v_latest from public.readings where site_id = p_site and metric = r.metric
          order by measured_at desc, id desc limit 1;
        if v_latest >= r.threshold then
          perform public._mark_recovered(v_active.id, 'telemetry', null, 'system',
            format('Reading back above threshold: %s', round(v_latest::numeric, 1)));
        end if;
      end if;
    end if;
  end loop;
end;
$$;

create function public._mark_recovered(p_incident uuid, p_method public.recovery_method, p_actor uuid,
  p_channel public.action_channel, p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  m record;
begin
  update public.incidents set status = 'recovered', recovered_at = now(), recovery_method = p_method
    where id = p_incident and status in ('open', 'acknowledged', 'assigned')
    returning * into v_inc;
  if v_inc.id is null then return; end if;
  perform public._audit(p_actor, p_channel, v_inc.site_id, 'incident', v_inc.id, 'recovery_verified',
    jsonb_build_object('method', p_method, 'note', p_note));
  for m in
    select sm.user_id, p.locale from public.site_members sm join public.profiles p on p.id = sm.user_id
    where sm.site_id = v_inc.site_id and sm.role in ('operator', 'technician')
  loop
    perform public._send_sms(v_inc.site_id, v_inc.id, m.user_id,
      case when m.locale = 'sw'
        then format('AquaSentinel %s: maji yamerejea. Jibu 3 kufunga tukio.', v_inc.reference)
        else format('AquaSentinel %s: flow restored. Reply 3 to close the incident.', v_inc.reference) end);
  end loop;
end;
$$;

-- No-data rule (device health). Run every 5 minutes by pg_cron, and for recovery after each reading.
create function public.check_device_health() returns void
language plpgsql security definer set search_path = '' as $$
declare
  r public.alert_rules;
  v_last timestamptz;
  v_active public.incidents;
  v_new_id uuid;
begin
  for r in select * from public.alert_rules where enabled and condition = 'no_data' loop
    select max(last_seen_at) into v_last from public.devices where site_id = r.site_id and revoked_at is null;
    select * into v_active from public.incidents where rule_id = r.id and status <> 'closed';
    if (v_last is null or v_last < now() - make_interval(mins => r.sustain_minutes)) and v_active.id is null then
      insert into public.incidents (reference, site_id, rule_id, title, severity, evidence, detected_at, is_simulated)
      select 'AS-' || lpad(nextval('public.incident_reference_seq')::text, 4, '0'), r.site_id, r.id, r.name,
        r.severity, jsonb_build_object('kind', 'no_data', 'minutes', r.sustain_minutes, 'last_seen_at', v_last,
          'suspected_cause', r.suspected_cause, 'recommended_action', r.recommended_action,
          'rule_explanation', r.explanation), now(), s.is_simulated
      from public.sites s where s.id = r.site_id
      returning id into v_new_id;
      perform public._audit(null, 'system', r.site_id, 'incident', v_new_id, 'detected',
        jsonb_build_object('rule', r.name, 'suspected_cause', r.suspected_cause));
      perform public._notify_incident(v_new_id);
    elsif v_active.id is not null and v_active.status in ('open', 'acknowledged', 'assigned')
          and v_last >= now() - interval '5 minutes' then
      perform public._mark_recovered(v_active.id, 'telemetry', null, 'system', 'Monitoring unit reporting again');
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Ingestion: authenticated, validated, idempotent, rate-limited (PROJECT_RULES §3, §4, §5)
-- ---------------------------------------------------------------------------------------------------------------
create function public._ingest(p_device uuid, p_seq bigint, p_measured_at timestamptz, p_readings jsonb,
  p_source text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_dev public.devices;
  v_item jsonb;
  v_metric public.metric;
  v_value double precision;
  v_unit text;
  v_accepted int := 0;
  v_duplicates int := 0;
  v_rejected jsonb := '[]'::jsonb;
  v_rows int;
  v_min double precision;
  v_max double precision;
begin
  select * into v_dev from public.devices where id = p_device;
  if v_dev.id is null or v_dev.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'device_not_authorised');
  end if;
  if p_measured_at > now() + interval '2 minutes' then
    return jsonb_build_object('ok', false, 'error', 'timestamp_in_future');
  end if;
  if p_measured_at < now() - interval '7 days' then
    return jsonb_build_object('ok', false, 'error', 'timestamp_too_old');
  end if;
  if jsonb_typeof(p_readings) <> 'array' or jsonb_array_length(p_readings) = 0 or jsonb_array_length(p_readings) > 10 then
    return jsonb_build_object('ok', false, 'error', 'invalid_payload');
  end if;

  for v_item in select * from jsonb_array_elements(p_readings) loop
    begin
      v_metric := (v_item ->> 'metric')::public.metric;
      v_value := (v_item ->> 'value')::double precision;
    exception when others then
      v_rejected := v_rejected || jsonb_build_object('item', v_item, 'reason', 'unknown_metric_or_value');
      continue;
    end;
    -- Plausibility ranges and canonical units per metric.
    select lo, hi, u into v_min, v_max, v_unit from (values
      ('pump_running'::public.metric, 0::float8, 1::float8, 'on/off'),
      ('flow_rate', 0, 200, 'm³/h'),
      ('tank_level', 0, 100, '%'),
      ('battery_voltage', 0, 60, 'V'),
      ('solar_power', 0, 50, 'kW')) as t(m, lo, hi, u) where m = v_metric;
    if v_value is null or v_value < v_min or v_value > v_max
       or (v_metric = 'pump_running' and v_value not in (0, 1)) then
      v_rejected := v_rejected || jsonb_build_object('metric', v_metric, 'value', v_value, 'reason', 'implausible_value');
      continue;
    end if;
    insert into public.readings (device_id, site_id, metric, value, unit, measured_at, seq, source)
    values (p_device, v_dev.site_id, v_metric, v_value, v_unit, p_measured_at, p_seq, p_source)
    on conflict (device_id, seq, metric) do nothing;
    get diagnostics v_rows = row_count;
    if v_rows = 1 then v_accepted := v_accepted + 1; else v_duplicates := v_duplicates + 1; end if;
  end loop;

  update public.devices set last_seen_at = greatest(coalesce(last_seen_at, p_measured_at), p_measured_at),
    last_seq = greatest(last_seq, p_seq) where id = p_device;

  if v_accepted > 0 then
    perform public._evaluate_rules(v_dev.site_id);
    -- Device-health recovery only for live data (not while back-filling buffered history).
    if p_measured_at > now() - interval '5 minutes' then
      perform public.check_device_health();
    end if;
  end if;
  if jsonb_array_length(v_rejected) > 0 then
    perform public._audit(null, 'device', v_dev.site_id, 'device', p_device, 'readings_rejected',
      jsonb_build_object('seq', p_seq, 'rejected', v_rejected));
  end if;
  return jsonb_build_object('ok', true, 'accepted', v_accepted, 'duplicates', v_duplicates, 'rejected', v_rejected);
end;
$$;

-- Public ingestion entry point used by POST /api/ingest. The device proves its identity with its own key;
-- only the key's SHA-256 hash is stored. No database credentials ever leave the server.
create function public.ingest_readings(p_device_key text, p_seq bigint, p_measured_at timestamptz,
  p_readings jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_device uuid;
begin
  if p_device_key is null or length(p_device_key) < 32 or p_seq is null or p_seq < 1 then
    return jsonb_build_object('ok', false, 'error', 'device_not_authorised');
  end if;
  select id into v_device from public.devices
    where key_hash = encode(extensions.digest(p_device_key, 'sha256'), 'hex') and revoked_at is null;
  if v_device is null then
    return jsonb_build_object('ok', false, 'error', 'device_not_authorised');
  end if;
  -- Rate limit per device: at most 30 messages per minute (protects the database from a faulty or abused unit).
  if (select count(distinct seq) from public.readings
      where device_id = v_device and received_at > now() - interval '1 minute') >= 30 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  return public._ingest(v_device, p_seq, p_measured_at, p_readings, 'field');
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Incident lifecycle: one implementation for every channel (web, SMS)
-- ---------------------------------------------------------------------------------------------------------------
create function public._acknowledge(p_incident uuid, p_actor uuid, p_channel public.action_channel) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  v_role public.member_role;
begin
  select * into v_inc from public.incidents where id = p_incident for update;
  if v_inc.id is null then return 'not_found'; end if;
  select role into v_role from public.site_members where site_id = v_inc.site_id and user_id = p_actor;
  if v_role is null then return 'not_authorised'; end if;
  if v_inc.status <> 'open' then return 'already_' || v_inc.status; end if;
  update public.incidents set status = 'acknowledged', acknowledged_at = now(), acknowledged_by = p_actor
    where id = p_incident;
  perform public._audit(p_actor, p_channel, v_inc.site_id, 'incident', p_incident, 'acknowledged');
  return 'ok';
end;
$$;

create function public._assign(p_incident uuid, p_actor uuid, p_technician uuid, p_channel public.action_channel)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  v_role public.member_role;
  v_tech_role public.member_role;
  v_tech_name text;
begin
  select * into v_inc from public.incidents where id = p_incident for update;
  if v_inc.id is null then return 'not_found'; end if;
  select role into v_role from public.site_members where site_id = v_inc.site_id and user_id = p_actor;
  if v_role is null then return 'not_authorised'; end if;
  select role into v_tech_role from public.site_members where site_id = v_inc.site_id and user_id = p_technician;
  if v_tech_role is distinct from 'technician' then return 'not_a_technician'; end if;
  if v_role = 'technician' and p_technician <> p_actor then return 'not_authorised'; end if;
  if v_inc.status not in ('open', 'acknowledged', 'assigned') then return 'already_' || v_inc.status; end if;
  update public.incidents set status = 'assigned', assigned_to = p_technician, assigned_at = now(),
    acknowledged_at = coalesce(acknowledged_at, now()), acknowledged_by = coalesce(acknowledged_by, p_actor)
    where id = p_incident;
  if v_inc.status = 'open' then
    perform public._audit(p_actor, p_channel, v_inc.site_id, 'incident', p_incident, 'acknowledged');
  end if;
  select full_name into v_tech_name from public.profiles where id = p_technician;
  perform public._audit(p_actor, p_channel, v_inc.site_id, 'incident', p_incident, 'assigned',
    jsonb_build_object('technician', v_tech_name));
  if p_technician <> p_actor then
    perform public._send_sms(v_inc.site_id, p_incident, p_technician,
      case when (select locale from public.profiles where id = p_technician) = 'sw'
        then format('AquaSentinel %s: umepewa kazi hii. Kagua: %s.', v_inc.reference,
          (select name_sw from public.alert_rules where id = v_inc.rule_id))
        else format('AquaSentinel %s: assigned to you. Please inspect: %s.', v_inc.reference, v_inc.title) end);
  end if;
  return 'ok';
end;
$$;

create function public._close(p_incident uuid, p_actor uuid, p_outcome public.incident_outcome, p_reason text,
  p_channel public.action_channel) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  v_role public.member_role;
begin
  select * into v_inc from public.incidents where id = p_incident for update;
  if v_inc.id is null then return 'not_found'; end if;
  select role into v_role from public.site_members where site_id = v_inc.site_id and user_id = p_actor;
  if v_role is null or v_role = 'technician' then return 'not_authorised'; end if;
  if v_inc.status = 'closed' then return 'already_closed'; end if;
  if coalesce(trim(p_reason), '') = '' then return 'reason_required'; end if;
  -- A repaired fault can only be closed after recovery is verified (telemetry or qualified manual check).
  if p_outcome = 'fault_repaired' and v_inc.status <> 'recovered' then return 'recovery_not_verified'; end if;
  update public.incidents set status = 'closed', closed_at = now(), closed_by = p_actor, outcome = p_outcome,
    close_reason = left(p_reason, 500) where id = p_incident;
  perform public._audit(p_actor, p_channel, v_inc.site_id, 'incident', p_incident, 'closed',
    jsonb_build_object('outcome', p_outcome, 'reason', left(p_reason, 500)));
  return 'ok';
end;
$$;

-- Web/mobile wrappers: the caller is the signed-in user (auth.uid()).
create function public.incident_acknowledge(p_incident uuid) returns text
language sql security definer set search_path = '' as $$
  select public._acknowledge(p_incident, (select auth.uid()), 'web');
$$;

create function public.incident_assign(p_incident uuid, p_technician uuid) returns text
language sql security definer set search_path = '' as $$
  select public._assign(p_incident, (select auth.uid()), p_technician, 'web');
$$;

create function public.incident_record_work(p_incident uuid, p_diagnosis text,
  p_diagnosis_status public.diagnosis_status, p_action_taken text, p_repair_cost_kes numeric) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  v_role public.member_role;
begin
  select * into v_inc from public.incidents where id = p_incident for update;
  if v_inc.id is null then return 'not_found'; end if;
  v_role := public.site_role(v_inc.site_id);
  if v_role is null or v_role not in ('technician', 'admin') then return 'not_authorised'; end if;
  if v_role = 'technician' and v_inc.assigned_to is distinct from (select auth.uid()) then return 'not_assigned_to_you'; end if;
  if v_inc.status = 'closed' then return 'already_closed'; end if;
  if coalesce(trim(p_diagnosis), '') = '' then return 'diagnosis_required'; end if;
  if p_repair_cost_kes is not null and p_repair_cost_kes < 0 then return 'invalid_cost'; end if;
  update public.incidents set diagnosis = left(p_diagnosis, 1000), diagnosis_status = p_diagnosis_status,
    action_taken = nullif(left(coalesce(p_action_taken, ''), 1000), ''), repair_cost_kes = p_repair_cost_kes
    where id = p_incident;
  perform public._audit((select auth.uid()), 'web', v_inc.site_id, 'incident', p_incident, 'work_recorded',
    jsonb_build_object('diagnosis', left(p_diagnosis, 200), 'diagnosis_status', p_diagnosis_status,
      'action_taken', left(coalesce(p_action_taken, ''), 200), 'repair_cost_kes', p_repair_cost_kes));
  return 'ok';
end;
$$;

-- Qualified manual verification when telemetry cannot confirm recovery (e.g. sensor not covering the fault).
create function public.incident_verify_recovery(p_incident uuid, p_note text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_inc public.incidents;
  v_role public.member_role;
begin
  select * into v_inc from public.incidents where id = p_incident;
  if v_inc.id is null then return 'not_found'; end if;
  v_role := public.site_role(v_inc.site_id);
  if v_role is null or v_role not in ('technician', 'admin') then return 'not_authorised'; end if;
  if v_inc.status not in ('open', 'acknowledged', 'assigned') then return 'already_' || v_inc.status; end if;
  if coalesce(trim(p_note), '') = '' then return 'note_required'; end if;
  perform public._mark_recovered(p_incident, 'manual', (select auth.uid()), 'web', left(p_note, 500));
  return 'ok';
end;
$$;

create function public.incident_close(p_incident uuid, p_outcome public.incident_outcome, p_reason text) returns text
language sql security definer set search_path = '' as $$
  select public._close(p_incident, (select auth.uid()), p_outcome, p_reason, 'web');
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Inbound SMS: verify sender, site and incident; consequential actions need confirmation (PROJECT_RULES §4).
-- SMS can never control a pump.
-- ---------------------------------------------------------------------------------------------------------------
create function public._handle_inbound_sms(p_from text, p_body text, p_simulated boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_profile public.profiles;
  v_cmd text := upper(trim(coalesce(p_body, '')));
  v_last_out public.sms_messages;
  v_inc public.incidents;
  v_role public.member_role;
  v_result text;
  v_tech uuid;
  v_sw boolean;
  v_reply text;
begin
  select * into v_profile from public.profiles where phone_e164 = p_from;
  if v_profile.id is null then
    -- Unknown sender: log nothing personal, reply nothing.
    return jsonb_build_object('ok', false, 'error', 'unknown_sender');
  end if;
  v_sw := v_profile.locale = 'sw';

  -- Context: the latest incident SMS this person received.
  select * into v_last_out from public.sms_messages
    where profile_id = v_profile.id and direction = 'outbound' and incident_id is not null
    order by created_at desc limit 1;
  if v_last_out.id is null then
    return jsonb_build_object('ok', false, 'error', 'no_incident_context');
  end if;
  select * into v_inc from public.incidents where id = v_last_out.incident_id;
  select role into v_role from public.site_members where site_id = v_inc.site_id and user_id = v_profile.id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'error', 'not_a_site_member');
  end if;

  insert into public.sms_messages (site_id, incident_id, profile_id, direction, phone_masked, body, status, is_simulated)
  values (v_inc.site_id, v_inc.id, v_profile.id, 'inbound', public.mask_phone(p_from), left(p_body, 480), 'received',
    p_simulated);

  if v_cmd = '1' then
    v_result := public._acknowledge(v_inc.id, v_profile.id, 'sms');
    v_reply := case when v_result = 'ok'
      then case when v_sw then format('%s imepokelewa. Asante.', v_inc.reference)
                else format('%s acknowledged. Thank you.', v_inc.reference) end
      else case when v_sw then format('%s: hatua haikufanyika (%s).', v_inc.reference, v_result)
                else format('%s: no change (%s).', v_inc.reference, v_result) end end;
  elsif v_cmd = '2' then
    if v_role = 'technician' then
      v_tech := v_profile.id;
    else
      select user_id into v_tech from public.site_members where site_id = v_inc.site_id and role = 'technician'
        order by created_at limit 1;
    end if;
    v_result := case when v_tech is null then 'no_technician' else public._assign(v_inc.id, v_profile.id, v_tech, 'sms') end;
    v_reply := case when v_result = 'ok'
      then case when v_sw then format('%s amepewa fundi %s.', v_inc.reference, (select full_name from public.profiles where id = v_tech))
                else format('%s assigned to %s.', v_inc.reference, (select full_name from public.profiles where id = v_tech)) end
      else case when v_sw then format('%s: hatua haikufanyika (%s).', v_inc.reference, v_result)
                else format('%s: no change (%s).', v_inc.reference, v_result) end end;
  elsif v_cmd = '3' then
    if v_inc.status = 'closed' then
      v_result := 'already_closed';
      v_reply := case when v_sw then format('%s tayari imefungwa.', v_inc.reference)
                      else format('%s is already closed.', v_inc.reference) end;
    elsif v_inc.status <> 'recovered' then
      v_result := 'recovery_not_verified';
      v_reply := case when v_sw then format('%s haiwezi kufungwa bado: maji hayajarejea. Fundi athibitishe kwanza.', v_inc.reference)
                      else format('%s cannot be closed yet: flow is not restored. A technician must verify recovery first.', v_inc.reference) end;
    elsif v_role = 'technician' then
      v_result := 'not_authorised';
      v_reply := case when v_sw then format('%s: mwendeshaji atafunga tukio hili.', v_inc.reference)
                      else format('%s: the operator will close this incident.', v_inc.reference) end;
    else
      perform public._send_sms(v_inc.site_id, v_inc.id, v_profile.id,
        case when v_sw then format('Thibitisha kufunga %s? Jibu NDIYO kufunga.', v_inc.reference)
             else format('Confirm closing %s? Reply YES to close.', v_inc.reference) end, 'close_incident');
      perform public._audit(v_profile.id, 'sms', v_inc.site_id, 'incident', v_inc.id, 'close_requested');
      return jsonb_build_object('ok', true, 'result', 'confirmation_requested', 'incident', v_inc.reference);
    end if;
  elsif v_cmd in ('YES', 'NDIYO') then
    if v_last_out.awaiting_confirmation = 'close_incident' and v_last_out.created_at > now() - interval '30 minutes' then
      v_result := public._close(v_inc.id, v_profile.id, 'fault_repaired', 'Closure confirmed by SMS reply', 'sms');
      update public.sms_messages set awaiting_confirmation = null where id = v_last_out.id;
      v_reply := case when v_result = 'ok'
        then case when v_sw then format('%s imefungwa. Asante.', v_inc.reference)
                  else format('%s closed. Thank you.', v_inc.reference) end
        else case when v_sw then format('%s: haikufungwa (%s).', v_inc.reference, v_result)
                  else format('%s: not closed (%s).', v_inc.reference, v_result) end end;
    else
      v_result := 'nothing_to_confirm';
      v_reply := case when v_sw then 'Hakuna cha kuthibitisha.' else 'Nothing to confirm.' end;
    end if;
  else
    v_result := 'unknown_command';
    v_reply := case when v_sw then 'Jibu 1 Kupokea, 2 Kumtuma fundi, 3 Imetatuliwa.'
                    else 'Reply 1 Ack, 2 Assign tech, 3 Resolved.' end;
  end if;

  perform public._send_sms(v_inc.site_id, v_inc.id, v_profile.id, v_reply);
  return jsonb_build_object('ok', v_result = 'ok', 'result', v_result, 'incident', v_inc.reference);
end;
$$;

-- Gate D: called only by the server-side SMS provider webhook (service role), after verifying the provider.
create function public.sms_receive(p_from text, p_body text) returns jsonb
language sql security definer set search_path = '' as $$
  select public._handle_inbound_sms(p_from, p_body, false);
$$;

-- Demonstration: the signed-in user replies from the on-screen phone simulator, as their own verified number.
-- Only allowed on SIMULATED sites; uses exactly the same handler as real SMS.
create function public.sms_simulate_reply(p_body text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_phone text;
begin
  select phone_e164 into v_phone from public.profiles where id = (select auth.uid());
  if v_phone is null then return jsonb_build_object('ok', false, 'error', 'no_phone_on_profile'); end if;
  if not exists (select 1 from public.site_members sm join public.sites s on s.id = sm.site_id
                 where sm.user_id = (select auth.uid()) and s.is_simulated) then
    return jsonb_build_object('ok', false, 'error', 'simulation_only_on_simulated_sites');
  end if;
  return public._handle_inbound_sms(v_phone, p_body, true);
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Demonstration support (SIMULATED sites only). Simulated readings go through the same validation and rules.
-- ---------------------------------------------------------------------------------------------------------------
create function public._simulated_reading_set(p_at timestamptz, p_tz text, p_scenario text, p_tank double precision)
returns jsonb
language plpgsql volatile set search_path = '' as $$
declare
  v_hour double precision := extract(hour from (p_at at time zone p_tz)) + extract(minute from (p_at at time zone p_tz)) / 60.0;
  v_solar double precision := greatest(0, 2.4 * sin(pi() * (v_hour - 6) / 12)) * (0.95 + random() * 0.1);
  v_pump double precision;
  v_flow double precision;
begin
  if v_hour < 6 or v_hour > 18 then v_solar := 0; end if;
  if p_scenario = 'pump_fault' then
    v_pump := 1; v_flow := round((random() * 0.2)::numeric, 2);
  elsif v_solar > 0.6 then
    v_pump := 1; v_flow := round((12.0 + random() * 0.9)::numeric, 1);
  else
    v_pump := 0; v_flow := 0;
  end if;
  return jsonb_build_array(
    jsonb_build_object('metric', 'pump_running', 'value', v_pump),
    jsonb_build_object('metric', 'flow_rate', 'value', v_flow),
    jsonb_build_object('metric', 'tank_level', 'value', round(p_tank::numeric, 1)),
    jsonb_build_object('metric', 'battery_voltage', 'value',
      round((case when v_solar > 0 then 25.6 else 24.1 end + random() * 0.4)::numeric, 1)),
    jsonb_build_object('metric', 'solar_power', 'value', round(v_solar::numeric, 2)));
end;
$$;

-- Next simulated tank level: rises while pumping, falls with community demand (higher in the day than at night).
create function public._next_tank_level(p_level double precision, p_readings jsonb, p_minutes double precision,
  p_local_hour double precision) returns double precision
language sql immutable set search_path = '' as $$
  select least(96, greatest(8, p_level
    + (case when (p_readings -> 1 ->> 'value')::float8 > 5 then 0.35 else 0 end) * p_minutes
    - (case when p_local_hour between 6 and 21 then 0.10 else 0.03 end) * p_minutes));
$$;

create function public._simulate_step(p_device uuid, p_at timestamptz) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_dev public.devices;
  v_tz text;
  v_tank double precision;
  v_set jsonb;
begin
  select * into v_dev from public.devices where id = p_device and is_simulated;
  if v_dev.id is null then return jsonb_build_object('ok', false, 'error', 'not_simulated'); end if;
  select timezone into v_tz from public.sites where id = v_dev.site_id;
  select value into v_tank from public.readings where device_id = p_device and metric = 'tank_level'
    order by measured_at desc, id desc limit 1;
  v_set := public._simulated_reading_set(p_at, v_tz, coalesce(v_dev.simulation_scenario, 'normal'), coalesce(v_tank, 62));
  v_set := jsonb_set(v_set, '{2,value}', to_jsonb(round(public._next_tank_level(coalesce(v_tank, 62), v_set,
    least(60, greatest(1, extract(epoch from (p_at - coalesce(v_dev.last_seen_at, p_at - interval '10 minutes'))) / 60.0)),
    extract(hour from (p_at at time zone v_tz)))::numeric, 1)));
  return public._ingest(p_device, v_dev.last_seq + 1, p_at, v_set, 'simulated');
end;
$$;

-- pg_cron, every 5 minutes: simulated devices keep reporting like a field unit would.
create function public.demo_tick() returns void
language plpgsql security definer set search_path = '' as $$
declare
  d record;
begin
  for d in select id from public.devices where is_simulated and revoked_at is null loop
    perform public._simulate_step(d.id, now());
  end loop;
end;
$$;

-- Generates 24 hours of SIMULATED normal operation for a new, empty demo site (insert-only; run once).
create function public._demo_generate_history(p_site uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_dev uuid;
  v_t timestamptz;
begin
  if not exists (select 1 from public.sites where id = p_site and is_simulated) then
    raise exception 'Only SIMULATED sites can have generated history';
  end if;
  if exists (select 1 from public.readings where site_id = p_site) then
    raise exception 'Site already has readings; history is generated only once';
  end if;
  for v_dev in select id from public.devices where site_id = p_site and is_simulated loop
    v_t := date_bin(interval '10 minutes', now() - interval '24 hours', timestamptz '2000-01-01');
    while v_t <= now() loop
      perform public._simulate_step(v_dev, v_t);
      v_t := v_t + interval '10 minutes';
    end loop;
  end loop;
  perform public._audit(null, 'system', p_site, 'site', p_site, 'demo_history_generated',
    jsonb_build_object('note', 'SIMULATED history generated (24 h)'));
end;
$$;

-- Demonstration input from the dashboard (committee/admin of a SIMULATED site only).
--  'pump_fault': fast-forward the simulated clock and record 12 min of "pump running, no flow" (rule fires).
--  'recovery'  : one reading with restored flow (telemetry recovery verification).
-- Demo history is cumulative: every run stays in the record (there is no reset).
create function public.demo_simulate(p_site uuid, p_scenario text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_role public.member_role := public.site_role(p_site);
  v_dev uuid;
  v_i int;
  v_minutes int;
begin
  if not exists (select 1 from public.sites where id = p_site and is_simulated) then
    return jsonb_build_object('ok', false, 'error', 'simulation_only_on_simulated_sites');
  end if;
  if v_role is null or v_role not in ('committee', 'admin') then
    return jsonb_build_object('ok', false, 'error', 'not_authorised');
  end if;
  if p_scenario not in ('pump_fault', 'recovery') then
    return jsonb_build_object('ok', false, 'error', 'unknown_scenario');
  end if;
  v_minutes := 12;
  for v_dev in select id from public.devices where site_id = p_site and is_simulated and revoked_at is null loop
    if p_scenario = 'pump_fault' then
      -- Fast-forward the SIMULATED clock by 12 minutes, then record 12 minutes of "pump running, no flow".
      -- This shows the sustained-duration rule live without waiting; field data is never shifted.
      update public.readings set measured_at = measured_at - make_interval(mins => v_minutes)
        where device_id = v_dev and source = 'simulated';
      update public.devices set simulation_scenario = 'pump_fault',
        last_seen_at = last_seen_at - make_interval(mins => v_minutes) where id = v_dev;
      for v_i in reverse (v_minutes - 1)..0 loop
        perform public._simulate_step(v_dev, now() - make_interval(mins => v_i));
      end loop;
    else
      -- Restored flow, as reported after a repair (forced running pump, even outside daylight hours).
      update public.devices set simulation_scenario = 'normal' where id = v_dev;
      perform public._ingest(v_dev, (select last_seq + 1 from public.devices where id = v_dev), now(),
        jsonb_build_array(jsonb_build_object('metric', 'pump_running', 'value', 1),
                          jsonb_build_object('metric', 'flow_rate', 'value', round((12.0 + random() * 0.8)::numeric, 1))),
        'simulated');
    end if;
  end loop;
  perform public._audit((select auth.uid()), 'web', p_site, 'site', p_site, 'demonstration_input',
    jsonb_build_object('scenario', p_scenario, 'note', 'SIMULATED readings injected through the validation and rule pipeline'));
  return jsonb_build_object('ok', true, 'scenario', p_scenario);
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Privileges: only the intended entry points are callable through the API
-- ---------------------------------------------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.site_role(uuid), public.is_site_member(uuid), public.mask_phone(text) to authenticated;
grant execute on function public.ingest_readings(text, bigint, timestamptz, jsonb) to anon, authenticated;
grant execute on function public.incident_acknowledge(uuid), public.incident_assign(uuid, uuid),
  public.incident_record_work(uuid, text, public.diagnosis_status, text, numeric),
  public.incident_verify_recovery(uuid, text), public.incident_close(uuid, public.incident_outcome, text),
  public.sms_simulate_reply(text), public.demo_simulate(uuid, text) to authenticated;
grant execute on function public.sms_receive(text, text) to service_role;

-- Realtime: screens update without a refresh (RLS still applies to every subscriber).
alter publication supabase_realtime add table public.incidents, public.sms_messages, public.audit_log, public.readings;

-- Scheduled jobs.
select cron.schedule('aquasentinel-device-health', '*/5 * * * *', $cron$select public.check_device_health()$cron$);
select cron.schedule('aquasentinel-demo-tick', '*/5 * * * *', $cron$select public.demo_tick()$cron$);
