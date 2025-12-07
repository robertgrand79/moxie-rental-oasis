-- Fix existing organization onboarding steps to match the UI
-- Update 'settings' to 'contact' and 'launch' to 'payments'
UPDATE organization_onboarding SET step_name = 'contact' WHERE step_name = 'settings';
UPDATE organization_onboarding SET step_name = 'payments' WHERE step_name = 'launch';