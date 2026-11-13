-- Present AquaSentinel as the live product it is (owner decision, 13 Nov 2026).
-- The words "SIMULATED"/"MAJARIBIO" are removed from SMS and names. The data source stays disclosed truthfully:
-- readings come from a virtual monitoring unit until field sensors are installed (Gate C).
-- Internal flags (sites.is_simulated, readings.source) are unchanged. Text updates only; no data is removed.

create or replace function public._incident_alert_body(p_incident uuid, p_locale text) returns text
language sql stable security definer set search_path = '' as $$
  select case when p_locale = 'sw' then
      format(E'AquaSentinel %s\nEneo: %s\nTahadhari: %s\n%s\nJibu 1 Kupokea, 2 Kumtuma fundi, 3 Imetatuliwa',
        i.reference, s.name, r.name_sw, public._evidence_text(i.evidence, 'sw'))
    else
      format(E'AquaSentinel %s\nSite: %s\nAlert: %s\n%s\nReply 1 Ack, 2 Assign tech, 3 Resolved',
        i.reference, s.name, r.name, public._evidence_text(i.evidence, 'en'))
    end
  from public.incidents i join public.sites s on s.id = i.site_id join public.alert_rules r on r.id = i.rule_id
  where i.id = p_incident;
$$;
revoke execute on function public._incident_alert_body(uuid, text) from public, anon, authenticated;

update public.sites
set description = 'Solar-powered pumping from River Athi into a storage pan through an ageing pipeline, with no '
  || 'elevated storage (IFSL brief §3.2). Readings come from a virtual monitoring unit until field sensors are '
  || 'installed (Gate C).'
where id = '5a1e0000-0000-4000-8000-000000000001';

update public.devices set name = 'MU-01 · virtual monitoring unit'
where site_id = '5a1e0000-0000-4000-8000-000000000001' and is_simulated;

update public.assets
set details = details - 'note' || jsonb_build_object('note', case kind
    when 'monitoring_unit' then 'Virtual monitoring unit until field sensors are installed (Gate C)'
    when 'storage_tank' then 'No elevated storage at present (IFSL brief §3.2)'
    when 'pipeline' then 'Ageing pipeline'
    else 'Existing infrastructure' end)
where site_id = '5a1e0000-0000-4000-8000-000000000001';
