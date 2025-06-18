
-- Fix the ambiguous column reference in generate_work_order_number function
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  work_order_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Fix: Explicitly reference work_orders.work_order_number to avoid ambiguity
  SELECT COALESCE(MAX(CAST(SUBSTRING(work_orders.work_order_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM work_orders
  WHERE work_orders.work_order_number LIKE 'WO' || current_year || '%';
  
  work_order_number := 'WO' || current_year || LPAD(next_number::TEXT, 4, '0');
  
  RETURN work_order_number;
END;
$function$
