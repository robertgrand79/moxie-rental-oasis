
-- Fix the work order number generation function to avoid ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  new_work_order_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- More robust extraction of sequence numbers
  -- Only consider work order numbers that follow the correct pattern: WO{YEAR}{4digits}
  WITH valid_work_orders AS (
    SELECT wo.work_order_number
    FROM work_orders wo
    WHERE wo.work_order_number ~ ('^WO' || current_year || '[0-9]{4}$')
  )
  SELECT COALESCE(MAX(CAST(RIGHT(valid_work_orders.work_order_number, 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM valid_work_orders;
  
  new_work_order_number := 'WO' || current_year || LPAD(next_number::TEXT, 4, '0');
  
  RETURN new_work_order_number;
END;
$function$
