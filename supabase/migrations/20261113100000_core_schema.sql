-- AquaSentinel core schema (Gate B).
-- One authoritative store for sites, devices, readings, rules, incidents, SMS and audit (PROJECT_RULES §3).
-- Least privilege: signed-in users may only READ rows of sites they belong to (RLS). Every write goes through
-- SECURITY DEFINER workflow functions that validate role and ownership (see the workflow migration).

-- ---------------------------------------------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------------------------------------------
create type public.member_role as enum ('operator', 'technician', 'committee', 'admin');
create type public.asset_kind as enum ('intake_pump', 'pipeline', 'storage_tank', 'solar_power', 'monitoring_unit');
create type public.metric as enum ('pump_running', 'flow_rate', 'tank_level', 'battery_voltage', 'solar_power');
create type public.rule_condition as enum ('pump_on_no_flow', 'pump_on_low_flow', 'below', 'below_in_daylight', 'no_data');
create type public.severity as enum ('warning', 'needs_attention');
create type public.incident_status as enum ('open', 'acknowledged', 'assigned', 'recovered', 'closed');
create type public.diagnosis_status as enum ('suspected', 'confirmed');
create type public.incident_outcome as enum ('fault_repaired', 'false_alarm', 'no_action_needed');
create type public.recovery_method as enum ('telemetry', 'manual');
create type public.action_channel as enum ('web', 'sms', 'system', 'device');
create type public.sms_direction as enum ('outbound', 'inbound');
create type public.sms_status as enum ('queued', 'sent', 'delivered', 'failed', 'received', 'rejected');

-- ---------------------------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(full_name) between 1 and 120),
  -- Used only to verify SMS senders. Never shown in full in the UI (see masked views/functions).
  phone_e164 text unique check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  locale text not null default 'en' check (locale in ('en', 'sw')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'People using AquaSentinel. Minimal personal data (PROJECT_RULES §4).';

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  timezone text not null default 'Africa/Nairobi',
  description text,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.sites is 'A community water system (e.g. river intake, pipeline, storage tank).';

create table public.site_members (
  site_id uuid not null references public.sites (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);
comment on table public.site_members is 'Who may see and act on which site, and in which role. Basis of all RLS.';

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  kind public.asset_kind not null,
  name text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
comment on table public.assets is 'Existing infrastructure AquaSentinel monitors and helps maintain (it never replaces it).';

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  asset_id uuid references public.assets (id) on delete set null,
  name text not null,
  -- Distinct, revocable identity per physical device. Only a SHA-256 hash of the key is stored.
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  key_hint text not null,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  last_seq bigint not null default 0,
  is_simulated boolean not null default false,
  -- Demonstration only: current simulated scenario ('normal' | 'pump_fault'); null for field devices.
  simulation_scenario text check (simulation_scenario in ('normal', 'pump_fault')),
  created_at timestamptz not null default now(),
  check ((simulation_scenario is null) or is_simulated)
);
comment on table public.devices is 'Monitoring units. Devices never hold database credentials; they post to the ingestion API.';

create table public.readings (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices (id) on delete cascade,
  site_id uuid not null references public.sites (id) on delete cascade,
  metric public.metric not null,
  value double precision not null,
  unit text not null,
  measured_at timestamptz not null,
  received_at timestamptz not null default now(),
  seq bigint not null check (seq > 0),
  source text not null check (source in ('field', 'simulated')),
  -- Idempotency: the same device message (seq) can be retried safely without duplicating data.
  unique (device_id, seq, metric)
);
create index readings_site_metric_time on public.readings (site_id, metric, measured_at desc);
comment on table public.readings is 'Validated sensor readings with unit, measurement time, receive time, sequence and source.';

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  name text not null,
  name_sw text not null,
  explanation text not null,
  metric public.metric,
  condition public.rule_condition not null,
  threshold double precision,
  sustain_minutes integer not null check (sustain_minutes between 1 and 1440),
  severity public.severity not null,
  suspected_cause text not null,
  recommended_action text not null,
  problem_reference text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  check ((condition = 'no_data') = (metric is null)),
  check ((condition = 'no_data') or threshold is not null)
);
comment on table public.alert_rules is 'Transparent, plain-language rules. Each states the suspected cause, never a confirmed diagnosis.';

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  site_id uuid not null references public.sites (id) on delete cascade,
  rule_id uuid not null references public.alert_rules (id),
  title text not null,
  severity public.severity not null,
  status public.incident_status not null default 'open',
  evidence jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null,
  acknowledged_at timestamptz,
  acknowledged_by uuid references public.profiles (id),
  assigned_to uuid references public.profiles (id),
  assigned_at timestamptz,
  diagnosis text,
  diagnosis_status public.diagnosis_status,
  action_taken text,
  repair_cost_kes numeric(12, 2) check (repair_cost_kes >= 0),
  recovered_at timestamptz,
  recovery_method public.recovery_method,
  closed_at timestamptz,
  closed_by uuid references public.profiles (id),
  close_reason text,
  outcome public.incident_outcome,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now(),
  check ((status = 'closed') = (closed_at is not null)),
  check ((status <> 'closed') or (outcome is not null and close_reason is not null)),
  check ((diagnosis is null) = (diagnosis_status is null))
);
-- At most one active incident per rule: repeated readings never create duplicate incidents.
create unique index incidents_one_active_per_rule on public.incidents (rule_id) where status <> 'closed';
create index incidents_site_detected on public.incidents (site_id, detected_at desc);
comment on table public.incidents is 'The single authoritative incident record shared by dashboard, mobile and SMS.';

create table public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  incident_id uuid references public.incidents (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  direction public.sms_direction not null,
  phone_masked text not null,
  body text not null check (length(body) <= 480),
  status public.sms_status not null,
  -- Pending SMS confirmation (e.g. closing an incident needs a YES reply).
  awaiting_confirmation text check (awaiting_confirmation in ('close_incident')),
  error text,
  is_simulated boolean not null default false,
  -- clock_timestamp(): keeps the true order of messages created within one transaction.
  created_at timestamptz not null default clock_timestamp(),
  delivered_at timestamptz
);
create index sms_site_time on public.sms_messages (site_id, created_at desc);
comment on table public.sms_messages is 'SMS sent and received, with the real delivery result. SMS is not end-to-end encrypted: no personal data in bodies.';

create table public.audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default clock_timestamp(),
  actor_id uuid references public.profiles (id) on delete set null,
  channel public.action_channel not null,
  site_id uuid references public.sites (id) on delete cascade,
  entity text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb
);
create index audit_entity on public.audit_log (entity, entity_id, occurred_at);
create index audit_site_time on public.audit_log (site_id, occurred_at desc);
comment on table public.audit_log is 'Append-only record of every consequential user and system action (PROJECT_RULES §4).';

-- ---------------------------------------------------------------------------------------------------------------
-- Profiles are created automatically for every new auth user.
-- ---------------------------------------------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone_e164, locale, is_demo)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), 'User'),
    nullif(new.raw_user_meta_data ->> 'phone_e164', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'locale', ''), 'en'),
    coalesce((new.raw_user_meta_data ->> 'is_demo')::boolean, false)
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------------------------------------------
-- Authorisation helpers (used by RLS and workflow functions)
-- ---------------------------------------------------------------------------------------------------------------
create function public.site_role(p_site_id uuid) returns public.member_role
language sql stable security definer set search_path = '' as $$
  select role from public.site_members where site_id = p_site_id and user_id = (select auth.uid());
$$;

create function public.is_site_member(p_site_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.site_members where site_id = p_site_id and user_id = (select auth.uid()));
$$;

create function public.mask_phone(p_phone text) returns text
language sql immutable set search_path = '' as $$
  select case when p_phone is null then '—'
              else left(p_phone, 4) || ' ••• ••' || right(p_phone, 3) end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Row Level Security: read-only, scoped to the user's sites
-- ---------------------------------------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.assets enable row level security;
alter table public.devices enable row level security;
alter table public.readings enable row level security;
alter table public.alert_rules enable row level security;
alter table public.incidents enable row level security;
alter table public.sms_messages enable row level security;
alter table public.audit_log enable row level security;

create policy "Read own profile and co-members" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or exists (
    select 1 from public.site_members mine join public.site_members theirs using (site_id)
    where mine.user_id = (select auth.uid()) and theirs.user_id = profiles.id));
create policy "Members read their sites" on public.sites for select to authenticated
  using (public.is_site_member(id));
create policy "Members read site membership" on public.site_members for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read assets" on public.assets for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read devices" on public.devices for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read readings" on public.readings for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read rules" on public.alert_rules for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read incidents" on public.incidents for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read SMS log" on public.sms_messages for select to authenticated
  using (public.is_site_member(site_id));
create policy "Members read audit log" on public.audit_log for select to authenticated
  using (public.is_site_member(site_id));

-- Table privileges: no direct writes from the API; anon reads nothing.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.sites, public.site_members, public.assets, public.readings, public.alert_rules,
  public.incidents, public.sms_messages, public.audit_log to authenticated;
-- Hide phone numbers and device key hashes from the API entirely.
grant select (id, full_name, locale, is_demo, created_at) on public.profiles to authenticated;
grant select (id, site_id, asset_id, name, key_hint, revoked_at, last_seen_at, is_simulated, simulation_scenario,
  created_at) on public.devices to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on function public.site_role(uuid), public.is_site_member(uuid), public.mask_phone(text) to authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

-- ---------------------------------------------------------------------------------------------------------------
-- Views (security_invoker: RLS of the caller applies). Reporting uses views, not extra tables.
-- ---------------------------------------------------------------------------------------------------------------
create view public.latest_readings with (security_invoker = true) as
  select distinct on (r.site_id, r.metric)
    r.site_id, r.device_id, r.metric, r.value, r.unit, r.measured_at, r.received_at, r.source,
    extract(epoch from (now() - r.measured_at))::int as age_seconds
  from public.readings r
  order by r.site_id, r.metric, r.measured_at desc;

create view public.device_health with (security_invoker = true) as
  select d.id, d.site_id, d.name, d.key_hint, d.is_simulated, d.last_seen_at,
    extract(epoch from (now() - d.last_seen_at))::int as seconds_since_last_seen,
    case when d.revoked_at is not null then 'revoked'
         when d.last_seen_at is null or d.last_seen_at < now() - interval '15 minutes' then 'offline'
         else 'online' end as connection
  from public.devices d;

create view public.site_status with (security_invoker = true) as
  select s.id as site_id, s.name, s.location, s.timezone, s.is_simulated,
    (select max(d.last_seen_at) from public.devices d where d.site_id = s.id and d.revoked_at is null) as last_reading_at,
    (select count(*) from public.incidents i where i.site_id = s.id and i.status <> 'closed')::int as active_incidents,
    case
      when not exists (select 1 from public.devices d where d.site_id = s.id and d.revoked_at is null
                       and d.last_seen_at > now() - interval '15 minutes') then 'offline'
      when exists (select 1 from public.incidents i where i.site_id = s.id and i.status in ('open', 'acknowledged', 'assigned')
                   and i.severity = 'needs_attention') then 'needs_attention'
      when exists (select 1 from public.incidents i where i.site_id = s.id and i.status in ('open', 'acknowledged', 'assigned')) then 'warning'
      else 'normal'
    end as status
  from public.sites s;

create view public.incident_timeline with (security_invoker = true) as
  select a.id, a.entity_id as incident_id, a.site_id, a.occurred_at, a.action, a.channel, a.details,
    p.full_name as actor_name
  from public.audit_log a
  left join public.profiles p on p.id = a.actor_id
  where a.entity = 'incident';

create view public.maintenance_history with (security_invoker = true) as
  select i.id, i.reference, i.site_id, i.title, i.detected_at, i.closed_at, i.outcome, i.diagnosis, i.diagnosis_status,
    i.action_taken, i.repair_cost_kes, i.recovery_method, i.is_simulated,
    tech.full_name as technician_name,
    round(extract(epoch from (i.recovered_at - i.detected_at)) / 60.0, 1) as downtime_minutes
  from public.incidents i
  left join public.profiles tech on tech.id = i.assigned_to
  where i.status = 'closed';

-- KPI definitions follow the proposal (Table 2). Values on the demo site are SIMULATED, never field results.
create view public.kpi_summary with (security_invoker = true) as
  select s.id as site_id, s.is_simulated,
    count(i.*)::int as incidents_opened,
    count(i.*) filter (where i.status = 'closed')::int as incidents_closed,
    round((percentile_cont(0.5) within group (order by extract(epoch from (i.acknowledged_at - i.detected_at)) / 60.0)
           filter (where i.acknowledged_at is not null))::numeric, 1) as median_response_minutes,
    round((percentile_cont(0.5) within group (order by extract(epoch from (i.recovered_at - i.detected_at)) / 60.0)
           filter (where i.recovered_at is not null and coalesce(i.outcome, 'fault_repaired') = 'fault_repaired'))::numeric, 1)
           as median_downtime_minutes,
    round(100.0 * count(i.*) filter (where i.outcome = 'false_alarm')
          / nullif(count(i.*) filter (where i.status = 'closed'), 0), 1) as false_alarm_rate_pct,
    round(100.0 * count(i.*) filter (where i.status = 'closed') / nullif(count(i.*), 0), 1) as maintenance_completion_pct,
    round(100.0 * count(i.*) filter (where i.severity = 'warning' and i.outcome = 'fault_repaired')
          / nullif(count(i.*) filter (where i.outcome = 'fault_repaired'), 0), 1) as early_detection_pct,
    coalesce(sum(i.repair_cost_kes) filter (where i.status = 'closed'), 0) as repair_cost_kes_total
  from public.sites s
  left join public.incidents i on i.site_id = s.id
  group by s.id, s.is_simulated;

-- Device uptime over the last 24 h: share of 5-minute windows with at least one reading.
create view public.device_uptime_24h with (security_invoker = true) as
  select d.id as device_id, d.site_id,
    round(100.0 * count(distinct date_bin(interval '5 minutes', r.measured_at, timestamptz '2000-01-01')) / 288.0, 1)
      as uptime_pct
  from public.devices d
  left join public.readings r on r.device_id = d.id and r.measured_at > now() - interval '24 hours'
  group by d.id, d.site_id;

grant select on public.latest_readings, public.device_health, public.site_status, public.incident_timeline,
  public.maintenance_history, public.kpi_summary, public.device_uptime_24h to authenticated;
