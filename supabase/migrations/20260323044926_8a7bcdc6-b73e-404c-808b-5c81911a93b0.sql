-- One-time cleanup: archive all noise/automated email notifications
UPDATE admin_notifications 
SET is_archived = true 
WHERE is_archived = false 
  AND notification_type = 'guest_message'
  AND category = 'communications'
  AND (
    metadata->>'sender_email' ILIKE '%@turno.com'
    OR metadata->>'sender_email' ILIKE '%@hospitable.com'
    OR metadata->>'sender_email' ILIKE '%@airbnb.com'
    OR metadata->>'sender_email' ILIKE '%@pinterest.com'
    OR metadata->>'sender_email' ILIKE '%@vrbo.com'
    OR metadata->>'sender_email' ILIKE '%noreply@%'
    OR metadata->>'sender_email' ILIKE '%no-reply@%'
    OR metadata->>'sender_email' ILIKE '%automated@%'
  );