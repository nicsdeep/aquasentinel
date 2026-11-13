-- New rule condition for problems reported by people (operators, technicians, later community members by SMS).
-- Kept in its own migration: a new enum value cannot be used in the transaction that adds it.
alter type public.rule_condition add value if not exists 'manual';
