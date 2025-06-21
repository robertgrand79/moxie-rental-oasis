
-- Fix the work order number generation function to be more robust
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  work_order_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- More robust extraction of sequence numbers
  -- Only consider work order numbers that follow the correct pattern: WO{YEAR}{4digits}
  WITH valid_work_orders AS (
    SELECT work_orders.work_order_number
    FROM work_orders
    WHERE work_orders.work_order_number ~ ('^WO' || current_year || '[0-9]{4}$')
  )
  SELECT COALESCE(MAX(CAST(RIGHT(work_order_number, 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM valid_work_orders;
  
  work_order_number := 'WO' || current_year || LPAD(next_number::TEXT, 4, '0');
  
  RETURN work_order_number;
END;
$function$

-- Clean up any malformed work order numbers (optional - you can skip this if you want to keep existing data)
-- This will identify malformed work order numbers for manual review
-- Uncomment the next line if you want to see what malformed numbers exist:
-- SELECT work_order_number FROM work_orders WHERE work_order_number !~ '^WO[0-9]{4}[0-9]{4}$';
