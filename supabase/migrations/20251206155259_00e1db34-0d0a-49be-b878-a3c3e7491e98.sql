-- Create booking confirmation email template
INSERT INTO message_templates (name, category, subject, content, is_active, is_default)
VALUES (
  'Booking Confirmation',
  'confirmation',
  'Your Booking is Confirmed - {{property_name}}',
  E'Dear {{guest_name}},\n\nThank you for your reservation! Your booking has been confirmed.\n\n**Booking Details:**\n- Property: {{property_name}}\n- Check-in: {{checkin_date}}\n- Check-out: {{checkout_date}}\n- Guests: {{guest_count}}\n- Total Amount: ${{total_amount}}\n\n**Property Address:**\n{{property_address}}\n\nWe look forward to hosting you!\n\nBest regards,\nThe Moxie Team',
  true,
  true
);

-- Create messaging rule to send confirmation immediately on booking
INSERT INTO messaging_rules (name, trigger_type, trigger_offset_hours, delivery_channel, template_id, is_active, priority)
SELECT 
  'Booking Confirmation Email',
  'booking_confirmed',
  0,
  'email',
  id,
  true,
  1
FROM message_templates 
WHERE name = 'Booking Confirmation' AND category = 'confirmation'
LIMIT 1;