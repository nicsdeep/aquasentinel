-- Operator workflows (14 Nov 2026, owner-approved additive change):
--  * people can report a problem; it becomes a normal incident (one per category; repeats are added to it)
--  * operators and technicians can log a daily routine check (stored in the audit log; no new table)
--  * SMS is marked "delivered" only when a real provider confirms it; demo sites record "sent"
--  * production-realistic names (the demonstration environment is identified once, in the account menu)
-- Additive only: no tables or rows are deleted.

-- Manual (person-reported) rules have no metric or threshold.
alter table public.alert_rules drop constraint alert_rules_check;
alter table public.alert_rules drop constraint alert_rules_check1;
alter table public.alert_rules add constraint alert_rules_metric_matches_condition
  check ((condition in ('no_data', 'manual')) = (metric is null));
alter table public.alert_rules add constraint alert_rules_threshold_required
  check (condition in ('no_data', 'manual') or threshold is not null);
alter table public.alert_rules add column category text;
create unique index alert_rules_site_category on public.alert_rules (site_id, category) where category is not null;
comment on column public.alert_rules.category is 'Problem category for person-reported (manual) rules.';

-- Rule engine: person-reported incidents are never opened or recovered by telemetry.
create or replace function public._evaluate_rules(p_site uuid) returns void
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

  for r in select * from public.alert_rules where site_id = p_site and enabled
    and condition not in ('no_data', 'manual') loop
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

-- Plain-language evidence, now including problems reported by people.
create or replace function public._evidence_text(p_evidence jsonb, p_locale text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v_kind text := p_evidence ->> 'kind';
  v_minutes text := p_evidence ->> 'minutes';
  v_value text := p_evidence ->> 'value';
  v_unit text := coalesce(p_evidence ->> 'unit', '');
  v_by text := coalesce(p_evidence ->> 'reported_by', '');
  v_note text := coalesce(nullif(p_evidence ->> 'note', ''), '');
begin
  if p_locale = 'sw' then
    return case v_kind
      when 'pump_on_no_flow' then format('Pampu inafanya kazi lakini hakuna maji: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'pump_on_low_flow' then format('Pampu inafanya kazi, maji ni kidogo: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'below' then format('Kiwango kiko chini: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'below_in_daylight' then format('Umeme wa jua uko chini mchana: %s %s kwa dakika %s.', v_value, v_unit, v_minutes)
      when 'no_data' then format('Kifaa hakijatuma taarifa kwa dakika %s.', v_minutes)
      when 'manual' then trim(format('Imeripotiwa na %s. %s', v_by, v_note))
      else '' end;
  end if;
  return case v_kind
    when 'pump_on_no_flow' then format('Pump running but no flow: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'pump_on_low_flow' then format('Pump running with reduced flow: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'below' then format('Below threshold: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'below_in_daylight' then format('Low solar output in daylight: %s %s for %s min.', v_value, v_unit, v_minutes)
    when 'no_data' then format('No data from the monitoring unit for %s min.', v_minutes)
    when 'manual' then trim(format('Reported by %s. %s', v_by, v_note))
    else '' end;
end;
$$;

-- SMS: "delivered" is reserved for confirmation from a real SMS provider (Gate D).
-- Demo sites record "sent"; real sites stay "queued" until the provider reports back.
create or replace function public._send_sms(p_site uuid, p_incident uuid, p_profile uuid, p_body text,
  p_awaiting text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_phone text;
  v_simulated boolean;
begin
  select phone_e164 into v_phone from public.profiles where id = p_profile;
  select is_simulated into v_simulated from public.sites where id = p_site;
  insert into public.sms_messages (site_id, incident_id, profile_id, direction, phone_masked, body, status,
    awaiting_confirmation, is_simulated, error)
  values (p_site, p_incident, p_profile, 'outbound', public.mask_phone(v_phone), left(p_body, 480),
    case when v_phone is null then 'failed'::public.sms_status
         when v_simulated then 'sent'::public.sms_status
         else 'queued'::public.sms_status end,
    p_awaiting, v_simulated,
    case when v_phone is null then 'No phone number on profile' end);
end;
$$;

-- A person reports a problem. Creates one incident per category; a repeat report is added to the open one.
create function public.report_problem(p_site uuid, p_category text, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := (select auth.uid());
  v_role public.member_role := public.site_role(p_site);
  v_name text;
  v_rule public.alert_rules;
  v_active public.incidents;
  v_id uuid;
  v_ref text;
  v_note text := nullif(left(trim(coalesce(p_note, '')), 500), '');
  c record;
begin
  if v_role is null then return jsonb_build_object('ok', false, 'error', 'not_authorised'); end if;
  select * into c from (values
    ('no_water', 'No water at the taps', 'Hakuna maji kwenye mabomba', 'needs_attention'::public.severity,
     'Reported by a person. Possible pump, pipeline or storage problem; not confirmed until inspected.',
     'Check the pump, flow and storage readings, then inspect the pipeline.', 'IFSL brief §3.2: unreliable pumping and conveyance'),
    ('leak', 'Leak or burst pipe', 'Bomba linavuja au limepasuka', 'needs_attention',
     'Reported by a person. Possible leak or burst on the pipeline; not confirmed until inspected.',
     'If safe, isolate the section and send a technician to repair it.', 'IFSL brief §3.2: ageing pipelines'),
    ('pump_stopped', 'Pump not running', 'Pampu haifanyi kazi', 'needs_attention',
     'Reported by a person. Possible pump, power or controller fault; not confirmed until inspected.',
     'Check the pump power and controller, then send a technician.', 'IFSL brief §3.2: unreliable pumping systems'),
    ('storage', 'Storage too low or overflowing', 'Hifadhi ya maji iko chini au inafurika', 'warning',
     'Reported by a person. Demand, pumping or a float valve may be the cause.',
     'Check the storage level reading and inform water users if rationing is needed.', 'IFSL brief §3.2: lack of elevated storage'),
    ('solar', 'Solar panel damaged or dirty', 'Paneli ya jua imeharibika au ni chafu', 'warning',
     'Reported by a person. Dirty or damaged panels reduce pumping hours.',
     'Clean the panels and check them for damage and loose wiring.', 'IFSL brief §3.2: solar downtimes'),
    ('other', 'Other problem reported', 'Tatizo lingine limeripotiwa', 'warning',
     'Reported by a person; details in the report.', 'Read the report and decide who should inspect.',
     'Community reporting fallback (proposal)')
  ) as t(key, name, name_sw, severity, cause, action, ref) where t.key = p_category;
  if c.key is null then return jsonb_build_object('ok', false, 'error', 'unknown_category'); end if;

  select * into v_rule from public.alert_rules where site_id = p_site and category = p_category;
  if v_rule.id is null then
    insert into public.alert_rules (site_id, name, name_sw, explanation, metric, condition, threshold, sustain_minutes,
      severity, suspected_cause, recommended_action, problem_reference, category)
    values (p_site, c.name, c.name_sw, 'Opened when a person reports this problem from the app or by SMS.',
      null, 'manual', null, 1, c.severity, c.cause, c.action, c.ref, p_category)
    returning * into v_rule;
  end if;
  select full_name into v_name from public.profiles where id = v_actor;

  select * into v_active from public.incidents where rule_id = v_rule.id and status <> 'closed';
  if v_active.id is not null then
    perform public._audit(v_actor, 'web', p_site, 'incident', v_active.id, 'additional_report',
      jsonb_build_object('reported_by', v_name, 'note', v_note));
    return jsonb_build_object('ok', true, 'result', 'added_to_existing', 'incident_id', v_active.id,
      'reference', v_active.reference);
  end if;

  insert into public.incidents (reference, site_id, rule_id, title, severity, evidence, detected_at, is_simulated)
  select 'AS-' || lpad(nextval('public.incident_reference_seq')::text, 4, '0'), p_site, v_rule.id, v_rule.name,
    v_rule.severity, jsonb_build_object('kind', 'manual', 'category', p_category, 'reported_by', v_name, 'note', v_note,
      'suspected_cause', v_rule.suspected_cause, 'recommended_action', v_rule.recommended_action,
      'rule_explanation', v_rule.explanation), now(), s.is_simulated
  from public.sites s where s.id = p_site
  returning id, reference into v_id, v_ref;
  perform public._audit(v_actor, 'web', p_site, 'incident', v_id, 'reported',
    jsonb_build_object('reported_by', v_name, 'category', p_category, 'note', v_note));
  perform public._notify_incident(v_id);
  return jsonb_build_object('ok', true, 'result', 'created', 'incident_id', v_id, 'reference', v_ref);
end;
$$;

-- Daily routine check by an operator or technician. Recorded in the audit log (no extra table).
create function public.log_routine_check(p_site uuid, p_items jsonb, p_note text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_role public.member_role := public.site_role(p_site);
  v_issues int;
begin
  if v_role is null or v_role not in ('operator', 'technician', 'admin') then return 'not_authorised'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 12 then
    return 'invalid_checklist';
  end if;
  select count(*) into v_issues from jsonb_array_elements(p_items) e where (e ->> 'ok')::boolean is not true;
  perform public._audit((select auth.uid()), 'web', p_site, 'site', p_site, 'routine_check',
    jsonb_build_object('items', p_items, 'issues', v_issues, 'note', nullif(left(trim(coalesce(p_note, '')), 500), '')));
  return 'ok';
end;
$$;

revoke execute on function public.report_problem(uuid, text, text), public.log_routine_check(uuid, jsonb, text)
  from public, anon;
grant execute on function public.report_problem(uuid, text, text), public.log_routine_check(uuid, jsonb, text)
  to authenticated;
revoke execute on function public._evaluate_rules(uuid), public._send_sms(uuid, uuid, uuid, text, text),
  public._evidence_text(jsonb, text) from public, anon, authenticated;

-- Production-realistic names for the demonstration site's people and device.
update public.profiles set full_name = 'Mwende Musyoka' where id = '5a1e0000-0000-4000-8000-0000000000a1';
update public.profiles set full_name = 'Otieno Kamau' where id = '5a1e0000-0000-4000-8000-0000000000a2';
update public.profiles set full_name = 'Wanza Mutua' where id = '5a1e0000-0000-4000-8000-0000000000a3';
update public.devices set name = 'MU-01 monitoring unit' where site_id = '5a1e0000-0000-4000-8000-000000000001';
update public.sites
set description = 'Solar-powered pumping from River Athi into a storage pan through an ageing pipeline, with no '
  || 'elevated storage (IFSL brief §3.2).'
where id = '5a1e0000-0000-4000-8000-000000000001';
update public.assets set details = details - 'note' || jsonb_build_object('note', 'Solar-powered; reports every 5 minutes over mobile data')
where site_id = '5a1e0000-0000-4000-8000-000000000001' and kind = 'monitoring_unit';
