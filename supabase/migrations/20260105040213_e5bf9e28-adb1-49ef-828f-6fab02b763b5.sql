-- Phase 4: Complete organization_id isolation for remaining tenant tables
-- Batch 4A: Property-related tables (9 tables)
-- Batch 4B: Child tables with parent FK (12 tables)
-- Batch 4C: Guest-facing tables (4 tables)

-- ============================================
-- BATCH 4A: Property-Related Tables (9 tables)
-- ============================================

-- 1. property_tax_assignments
ALTER TABLE property_tax_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_property_tax_assignments_org ON property_tax_assignments(organization_id);

-- 2. turno_property_mapping
ALTER TABLE turno_property_mapping ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_turno_property_mapping_org ON turno_property_mapping(organization_id);

-- 3. property_stripe_credentials
ALTER TABLE property_stripe_credentials ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_property_stripe_credentials_org ON property_stripe_credentials(organization_id);

-- 4. configuration_audit_log
ALTER TABLE configuration_audit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_configuration_audit_log_org ON configuration_audit_log(organization_id);

-- 5. property_analytics
ALTER TABLE property_analytics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_property_analytics_org ON property_analytics(organization_id);

-- 6. calendar_sync_logs
ALTER TABLE calendar_sync_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_org ON calendar_sync_logs(organization_id);

-- 7. sync_logs
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_org ON sync_logs(organization_id);

-- 8. sync_metadata
ALTER TABLE sync_metadata ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_org ON sync_metadata(organization_id);

-- 9. setup_tokens
ALTER TABLE setup_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_setup_tokens_org ON setup_tokens(organization_id);

-- Backfill Batch 4A from properties
UPDATE property_tax_assignments SET organization_id = p.organization_id
FROM properties p WHERE property_tax_assignments.property_id = p.id AND property_tax_assignments.organization_id IS NULL;

UPDATE turno_property_mapping SET organization_id = p.organization_id
FROM properties p WHERE turno_property_mapping.property_id = p.id AND turno_property_mapping.organization_id IS NULL;

UPDATE property_stripe_credentials SET organization_id = p.organization_id
FROM properties p WHERE property_stripe_credentials.property_id = p.id AND property_stripe_credentials.organization_id IS NULL;

UPDATE configuration_audit_log SET organization_id = p.organization_id
FROM properties p WHERE configuration_audit_log.property_id = p.id AND configuration_audit_log.organization_id IS NULL;

UPDATE property_analytics SET organization_id = p.organization_id
FROM properties p WHERE property_analytics.property_id = p.id AND property_analytics.organization_id IS NULL;

UPDATE calendar_sync_logs SET organization_id = p.organization_id
FROM properties p WHERE calendar_sync_logs.property_id = p.id AND calendar_sync_logs.organization_id IS NULL;

UPDATE sync_logs SET organization_id = p.organization_id
FROM properties p WHERE sync_logs.property_id = p.id AND sync_logs.organization_id IS NULL;

UPDATE sync_metadata SET organization_id = p.organization_id
FROM properties p WHERE sync_metadata.property_id = p.id AND sync_metadata.organization_id IS NULL;

UPDATE setup_tokens SET organization_id = p.organization_id
FROM properties p WHERE setup_tokens.property_id = p.id AND setup_tokens.organization_id IS NULL;

-- Attach triggers for Batch 4A (reuse existing function)
DROP TRIGGER IF EXISTS set_property_tax_assignments_org_id ON property_tax_assignments;
CREATE TRIGGER set_property_tax_assignments_org_id
  BEFORE INSERT ON property_tax_assignments
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_turno_property_mapping_org_id ON turno_property_mapping;
CREATE TRIGGER set_turno_property_mapping_org_id
  BEFORE INSERT ON turno_property_mapping
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_property_stripe_credentials_org_id ON property_stripe_credentials;
CREATE TRIGGER set_property_stripe_credentials_org_id
  BEFORE INSERT ON property_stripe_credentials
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_configuration_audit_log_org_id ON configuration_audit_log;
CREATE TRIGGER set_configuration_audit_log_org_id
  BEFORE INSERT ON configuration_audit_log
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_property_analytics_org_id ON property_analytics;
CREATE TRIGGER set_property_analytics_org_id
  BEFORE INSERT ON property_analytics
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_calendar_sync_logs_org_id ON calendar_sync_logs;
CREATE TRIGGER set_calendar_sync_logs_org_id
  BEFORE INSERT ON calendar_sync_logs
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_sync_logs_org_id ON sync_logs;
CREATE TRIGGER set_sync_logs_org_id
  BEFORE INSERT ON sync_logs
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_sync_metadata_org_id ON sync_metadata;
CREATE TRIGGER set_sync_metadata_org_id
  BEFORE INSERT ON sync_metadata
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

DROP TRIGGER IF EXISTS set_setup_tokens_org_id ON setup_tokens;
CREATE TRIGGER set_setup_tokens_org_id
  BEFORE INSERT ON setup_tokens
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_property();

-- ============================================
-- BATCH 4B: Child Tables with Parent FK (12 tables)
-- ============================================

-- 1. work_order_status_history
ALTER TABLE work_order_status_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_work_order_status_history_org ON work_order_status_history(organization_id);

-- 2. work_order_acknowledgement_tokens
ALTER TABLE work_order_acknowledgement_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_work_order_acknowledgement_tokens_org ON work_order_acknowledgement_tokens(organization_id);

-- 3. chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_org ON chat_messages(organization_id);

-- 4. assistant_messages
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_org ON assistant_messages(organization_id);

-- 5. support_ticket_responses
ALTER TABLE support_ticket_responses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_org ON support_ticket_responses(organization_id);

-- 6. maintenance_checklist_items
ALTER TABLE maintenance_checklist_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_maintenance_checklist_items_org ON maintenance_checklist_items(organization_id);

-- 7. newsletter_analytics
ALTER TABLE newsletter_analytics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_org ON newsletter_analytics(organization_id);

-- 8. newsletter_click_tracking
ALTER TABLE newsletter_click_tracking ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_newsletter_click_tracking_org ON newsletter_click_tracking(organization_id);

-- 9. scheduled_messages
ALTER TABLE scheduled_messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_org ON scheduled_messages(organization_id);

-- 10. device_events
ALTER TABLE device_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_device_events_org ON device_events(organization_id);

-- 11. device_maintenance_alerts
ALTER TABLE device_maintenance_alerts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_device_maintenance_alerts_org ON device_maintenance_alerts(organization_id);

-- 12. guest_communications (also in 4C but parent is thread)
ALTER TABLE guest_communications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_guest_communications_org ON guest_communications(organization_id);

-- Create trigger functions for Batch 4B parent relationships

CREATE OR REPLACE FUNCTION set_organization_id_from_work_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.work_order_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM work_orders WHERE id = NEW.work_order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_chat_session()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.session_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM chat_sessions WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_conversation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.conversation_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM assistant_conversations WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_support_ticket()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.ticket_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM support_tickets WHERE id = NEW.ticket_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.template_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM maintenance_checklist_templates WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_campaign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.campaign_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM newsletter_campaigns WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_rule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.rule_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM messaging_rules WHERE id = NEW.rule_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_thread()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.thread_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM guest_inbox_threads WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill Batch 4B from parent tables
UPDATE work_order_status_history SET organization_id = wo.organization_id
FROM work_orders wo WHERE work_order_status_history.work_order_id = wo.id AND work_order_status_history.organization_id IS NULL;

UPDATE work_order_acknowledgement_tokens SET organization_id = wo.organization_id
FROM work_orders wo WHERE work_order_acknowledgement_tokens.work_order_id = wo.id AND work_order_acknowledgement_tokens.organization_id IS NULL;

UPDATE chat_messages SET organization_id = cs.organization_id
FROM chat_sessions cs WHERE chat_messages.session_id = cs.id AND chat_messages.organization_id IS NULL;

UPDATE assistant_messages SET organization_id = ac.organization_id
FROM assistant_conversations ac WHERE assistant_messages.conversation_id = ac.id AND assistant_messages.organization_id IS NULL;

UPDATE support_ticket_responses SET organization_id = st.organization_id
FROM support_tickets st WHERE support_ticket_responses.ticket_id = st.id AND support_ticket_responses.organization_id IS NULL;

UPDATE maintenance_checklist_items SET organization_id = mct.organization_id
FROM maintenance_checklist_templates mct WHERE maintenance_checklist_items.template_id = mct.id AND maintenance_checklist_items.organization_id IS NULL;

UPDATE newsletter_analytics SET organization_id = nc.organization_id
FROM newsletter_campaigns nc WHERE newsletter_analytics.campaign_id = nc.id AND newsletter_analytics.organization_id IS NULL;

UPDATE newsletter_click_tracking SET organization_id = nc.organization_id
FROM newsletter_campaigns nc WHERE newsletter_click_tracking.campaign_id = nc.id AND newsletter_click_tracking.organization_id IS NULL;

UPDATE scheduled_messages SET organization_id = mr.organization_id
FROM messaging_rules mr WHERE scheduled_messages.rule_id = mr.id AND scheduled_messages.organization_id IS NULL;

UPDATE device_events SET organization_id = sd.organization_id
FROM seam_devices sd WHERE device_events.device_id = sd.id AND device_events.organization_id IS NULL;

UPDATE device_maintenance_alerts SET organization_id = sd.organization_id
FROM seam_devices sd WHERE device_maintenance_alerts.device_id = sd.id AND device_maintenance_alerts.organization_id IS NULL;

UPDATE guest_communications SET organization_id = git.organization_id
FROM guest_inbox_threads git WHERE guest_communications.thread_id = git.id AND guest_communications.organization_id IS NULL;

-- Attach triggers for Batch 4B
DROP TRIGGER IF EXISTS set_work_order_status_history_org_id ON work_order_status_history;
CREATE TRIGGER set_work_order_status_history_org_id
  BEFORE INSERT ON work_order_status_history
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_work_order();

DROP TRIGGER IF EXISTS set_work_order_acknowledgement_tokens_org_id ON work_order_acknowledgement_tokens;
CREATE TRIGGER set_work_order_acknowledgement_tokens_org_id
  BEFORE INSERT ON work_order_acknowledgement_tokens
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_work_order();

DROP TRIGGER IF EXISTS set_chat_messages_org_id ON chat_messages;
CREATE TRIGGER set_chat_messages_org_id
  BEFORE INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_chat_session();

DROP TRIGGER IF EXISTS set_assistant_messages_org_id ON assistant_messages;
CREATE TRIGGER set_assistant_messages_org_id
  BEFORE INSERT ON assistant_messages
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_conversation();

DROP TRIGGER IF EXISTS set_support_ticket_responses_org_id ON support_ticket_responses;
CREATE TRIGGER set_support_ticket_responses_org_id
  BEFORE INSERT ON support_ticket_responses
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_support_ticket();

DROP TRIGGER IF EXISTS set_maintenance_checklist_items_org_id ON maintenance_checklist_items;
CREATE TRIGGER set_maintenance_checklist_items_org_id
  BEFORE INSERT ON maintenance_checklist_items
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_template();

DROP TRIGGER IF EXISTS set_newsletter_analytics_org_id ON newsletter_analytics;
CREATE TRIGGER set_newsletter_analytics_org_id
  BEFORE INSERT ON newsletter_analytics
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_campaign();

DROP TRIGGER IF EXISTS set_newsletter_click_tracking_org_id ON newsletter_click_tracking;
CREATE TRIGGER set_newsletter_click_tracking_org_id
  BEFORE INSERT ON newsletter_click_tracking
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_campaign();

DROP TRIGGER IF EXISTS set_scheduled_messages_org_id ON scheduled_messages;
CREATE TRIGGER set_scheduled_messages_org_id
  BEFORE INSERT ON scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_rule();

DROP TRIGGER IF EXISTS set_device_events_org_id ON device_events;
CREATE TRIGGER set_device_events_org_id
  BEFORE INSERT ON device_events
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_seam_device();

DROP TRIGGER IF EXISTS set_device_maintenance_alerts_org_id ON device_maintenance_alerts;
CREATE TRIGGER set_device_maintenance_alerts_org_id
  BEFORE INSERT ON device_maintenance_alerts
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_seam_device();

DROP TRIGGER IF EXISTS set_guest_communications_org_id ON guest_communications;
CREATE TRIGGER set_guest_communications_org_id
  BEFORE INSERT ON guest_communications
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_thread();

-- ============================================
-- BATCH 4C: Guest-Facing Tables (3 more tables)
-- ============================================

-- 1. guest_notifications
ALTER TABLE guest_notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_guest_notifications_org ON guest_notifications(organization_id);

-- 2. guest_support_chats
ALTER TABLE guest_support_chats ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_guest_support_chats_org ON guest_support_chats(organization_id);

-- 3. guest_support_messages
ALTER TABLE guest_support_messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_guest_support_messages_org ON guest_support_messages(organization_id);

-- Create trigger functions for Batch 4C
CREATE OR REPLACE FUNCTION set_organization_id_from_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.reservation_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM reservations WHERE id = NEW.reservation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_from_guest_chat()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.chat_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM guest_support_chats WHERE id = NEW.chat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill Batch 4C
UPDATE guest_notifications SET organization_id = r.organization_id
FROM reservations r WHERE guest_notifications.reservation_id = r.id AND guest_notifications.organization_id IS NULL;

UPDATE guest_support_chats SET organization_id = pr.organization_id
FROM property_reservations pr WHERE guest_support_chats.reservation_id = pr.id AND guest_support_chats.organization_id IS NULL;

UPDATE guest_support_messages SET organization_id = gsc.organization_id
FROM guest_support_chats gsc WHERE guest_support_messages.chat_id = gsc.id AND guest_support_messages.organization_id IS NULL;

-- Attach triggers for Batch 4C
DROP TRIGGER IF EXISTS set_guest_notifications_org_id ON guest_notifications;
CREATE TRIGGER set_guest_notifications_org_id
  BEFORE INSERT ON guest_notifications
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_reservation();

DROP TRIGGER IF EXISTS set_guest_support_chats_org_id ON guest_support_chats;
CREATE TRIGGER set_guest_support_chats_org_id
  BEFORE INSERT ON guest_support_chats
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_reservation();

DROP TRIGGER IF EXISTS set_guest_support_messages_org_id ON guest_support_messages;
CREATE TRIGGER set_guest_support_messages_org_id
  BEFORE INSERT ON guest_support_messages
  FOR EACH ROW EXECUTE FUNCTION set_organization_id_from_guest_chat();

-- ============================================
-- RLS POLICIES FOR ALL PHASE 4 TABLES
-- ============================================

-- Batch 4A RLS Policies
DROP POLICY IF EXISTS "Org members can view property_tax_assignments" ON property_tax_assignments;
CREATE POLICY "Org members can view property_tax_assignments" ON property_tax_assignments
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage property_tax_assignments" ON property_tax_assignments;
CREATE POLICY "Org members can manage property_tax_assignments" ON property_tax_assignments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view turno_property_mapping" ON turno_property_mapping;
CREATE POLICY "Org members can view turno_property_mapping" ON turno_property_mapping
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage turno_property_mapping" ON turno_property_mapping;
CREATE POLICY "Org members can manage turno_property_mapping" ON turno_property_mapping
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view property_stripe_credentials" ON property_stripe_credentials;
CREATE POLICY "Org members can view property_stripe_credentials" ON property_stripe_credentials
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage property_stripe_credentials" ON property_stripe_credentials;
CREATE POLICY "Org members can manage property_stripe_credentials" ON property_stripe_credentials
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view configuration_audit_log" ON configuration_audit_log;
CREATE POLICY "Org members can view configuration_audit_log" ON configuration_audit_log
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage configuration_audit_log" ON configuration_audit_log;
CREATE POLICY "Org members can manage configuration_audit_log" ON configuration_audit_log
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view property_analytics" ON property_analytics;
CREATE POLICY "Org members can view property_analytics" ON property_analytics
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage property_analytics" ON property_analytics;
CREATE POLICY "Org members can manage property_analytics" ON property_analytics
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view calendar_sync_logs" ON calendar_sync_logs;
CREATE POLICY "Org members can view calendar_sync_logs" ON calendar_sync_logs
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage calendar_sync_logs" ON calendar_sync_logs;
CREATE POLICY "Org members can manage calendar_sync_logs" ON calendar_sync_logs
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view sync_logs" ON sync_logs;
CREATE POLICY "Org members can view sync_logs" ON sync_logs
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage sync_logs" ON sync_logs;
CREATE POLICY "Org members can manage sync_logs" ON sync_logs
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view sync_metadata" ON sync_metadata;
CREATE POLICY "Org members can view sync_metadata" ON sync_metadata
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage sync_metadata" ON sync_metadata;
CREATE POLICY "Org members can manage sync_metadata" ON sync_metadata
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view setup_tokens" ON setup_tokens;
CREATE POLICY "Org members can view setup_tokens" ON setup_tokens
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage setup_tokens" ON setup_tokens;
CREATE POLICY "Org members can manage setup_tokens" ON setup_tokens
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Batch 4B RLS Policies
DROP POLICY IF EXISTS "Org members can view work_order_status_history" ON work_order_status_history;
CREATE POLICY "Org members can view work_order_status_history" ON work_order_status_history
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage work_order_status_history" ON work_order_status_history;
CREATE POLICY "Org members can manage work_order_status_history" ON work_order_status_history
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view work_order_acknowledgement_tokens" ON work_order_acknowledgement_tokens;
CREATE POLICY "Org members can view work_order_acknowledgement_tokens" ON work_order_acknowledgement_tokens
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage work_order_acknowledgement_tokens" ON work_order_acknowledgement_tokens;
CREATE POLICY "Org members can manage work_order_acknowledgement_tokens" ON work_order_acknowledgement_tokens
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view chat_messages" ON chat_messages;
CREATE POLICY "Org members can view chat_messages" ON chat_messages
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage chat_messages" ON chat_messages;
CREATE POLICY "Org members can manage chat_messages" ON chat_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view assistant_messages" ON assistant_messages;
CREATE POLICY "Org members can view assistant_messages" ON assistant_messages
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage assistant_messages" ON assistant_messages;
CREATE POLICY "Org members can manage assistant_messages" ON assistant_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view support_ticket_responses" ON support_ticket_responses;
CREATE POLICY "Org members can view support_ticket_responses" ON support_ticket_responses
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage support_ticket_responses" ON support_ticket_responses;
CREATE POLICY "Org members can manage support_ticket_responses" ON support_ticket_responses
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view maintenance_checklist_items" ON maintenance_checklist_items;
CREATE POLICY "Org members can view maintenance_checklist_items" ON maintenance_checklist_items
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage maintenance_checklist_items" ON maintenance_checklist_items;
CREATE POLICY "Org members can manage maintenance_checklist_items" ON maintenance_checklist_items
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view newsletter_analytics" ON newsletter_analytics;
CREATE POLICY "Org members can view newsletter_analytics" ON newsletter_analytics
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage newsletter_analytics" ON newsletter_analytics;
CREATE POLICY "Org members can manage newsletter_analytics" ON newsletter_analytics
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view newsletter_click_tracking" ON newsletter_click_tracking;
CREATE POLICY "Org members can view newsletter_click_tracking" ON newsletter_click_tracking
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage newsletter_click_tracking" ON newsletter_click_tracking;
CREATE POLICY "Org members can manage newsletter_click_tracking" ON newsletter_click_tracking
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view scheduled_messages" ON scheduled_messages;
CREATE POLICY "Org members can view scheduled_messages" ON scheduled_messages
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage scheduled_messages" ON scheduled_messages;
CREATE POLICY "Org members can manage scheduled_messages" ON scheduled_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view device_events" ON device_events;
CREATE POLICY "Org members can view device_events" ON device_events
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage device_events" ON device_events;
CREATE POLICY "Org members can manage device_events" ON device_events
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view device_maintenance_alerts" ON device_maintenance_alerts;
CREATE POLICY "Org members can view device_maintenance_alerts" ON device_maintenance_alerts
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage device_maintenance_alerts" ON device_maintenance_alerts;
CREATE POLICY "Org members can manage device_maintenance_alerts" ON device_maintenance_alerts
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view guest_communications" ON guest_communications;
CREATE POLICY "Org members can view guest_communications" ON guest_communications
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage guest_communications" ON guest_communications;
CREATE POLICY "Org members can manage guest_communications" ON guest_communications
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Batch 4C RLS Policies
DROP POLICY IF EXISTS "Org members can view guest_notifications" ON guest_notifications;
CREATE POLICY "Org members can view guest_notifications" ON guest_notifications
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage guest_notifications" ON guest_notifications;
CREATE POLICY "Org members can manage guest_notifications" ON guest_notifications
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view guest_support_chats" ON guest_support_chats;
CREATE POLICY "Org members can view guest_support_chats" ON guest_support_chats
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage guest_support_chats" ON guest_support_chats;
CREATE POLICY "Org members can manage guest_support_chats" ON guest_support_chats
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can view guest_support_messages" ON guest_support_messages;
CREATE POLICY "Org members can view guest_support_messages" ON guest_support_messages
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can manage guest_support_messages" ON guest_support_messages;
CREATE POLICY "Org members can manage guest_support_messages" ON guest_support_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));