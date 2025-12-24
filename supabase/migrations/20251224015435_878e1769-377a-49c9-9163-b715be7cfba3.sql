-- Allow deleting auth.users without being blocked by public.* audit/content references.
-- Any FK in public schema pointing to auth.users with NO ACTION is changed to ON DELETE SET NULL.
-- We also drop NOT NULL on the FK columns to make SET NULL possible.

DO $$
DECLARE
  r record;
  col text;
BEGIN
  FOR r IN
    SELECT
      con.conname,
      con.conrelid::regclass AS table_name,
      array_agg(att.attname ORDER BY x.ordinality) AS cols_arr,
      string_agg(quote_ident(att.attname), ', ' ORDER BY x.ordinality) AS cols_list,
      string_agg(quote_ident(att2.attname), ', ' ORDER BY x.ordinality) AS ref_cols_list
    FROM pg_constraint con
    JOIN unnest(con.conkey) WITH ORDINALITY AS x(attnum, ordinality) ON true
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = x.attnum
    JOIN unnest(con.confkey) WITH ORDINALITY AS y(attnum, ordinality) ON y.ordinality = x.ordinality
    JOIN pg_attribute att2 ON att2.attrelid = con.confrelid AND att2.attnum = y.attnum
    WHERE con.contype = 'f'
      AND con.connamespace = 'public'::regnamespace
      AND con.confrelid = 'auth.users'::regclass
      AND con.confdeltype = 'a'
    GROUP BY con.conname, con.conrelid
  LOOP
    -- Ensure columns are nullable for SET NULL
    FOREACH col IN ARRAY r.cols_arr LOOP
      EXECUTE format('ALTER TABLE %s ALTER COLUMN %I DROP NOT NULL', r.table_name, col);
    END LOOP;

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.table_name, r.conname);

    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%s) REFERENCES auth.users(%s) ON DELETE SET NULL',
      r.table_name,
      r.conname,
      r.cols_list,
      r.ref_cols_list
    );
  END LOOP;
END $$;