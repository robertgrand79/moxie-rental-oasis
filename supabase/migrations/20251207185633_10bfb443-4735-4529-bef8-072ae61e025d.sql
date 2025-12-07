-- Mark Moxie Vacation Rentals as onboarding complete
UPDATE organizations 
SET onboarding_completed = true, 
    onboarding_step = 4
WHERE slug = 'moxie';

-- Also mark any onboarding steps as complete
UPDATE organization_onboarding
SET completed = true, completed_at = now()
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'moxie');