-- Fix: assistant_escalations blocks property deletion due to NO ACTION rule
-- Change to SET NULL so escalation records are preserved but property reference is cleared
ALTER TABLE public.assistant_escalations
  DROP CONSTRAINT assistant_escalations_property_id_fkey;

ALTER TABLE public.assistant_escalations
  ADD CONSTRAINT assistant_escalations_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;