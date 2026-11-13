-- Fails if any table in an API-exposed schema has Row Level Security disabled.
-- Run in CI against a database built from supabase/migrations (PROJECT_RULES §4).
do $$
declare
  missing text;
begin
  select string_agg(format('%I.%I', n.nspname, c.relname), ', ' order by n.nspname, c.relname)
    into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p')
    and n.nspname = 'public'
    and not c.relrowsecurity;

  if missing is not null then
    raise exception 'Row Level Security is disabled on: %. Add "alter table ... enable row level security" and policies in the same migration.', missing;
  end if;
  raise notice 'RLS check passed: every table in the public schema has RLS enabled.';
end
$$;
