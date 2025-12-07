-- Add organization_id to eugene_events
ALTER TABLE eugene_events ADD COLUMN organization_id uuid REFERENCES organizations(id);
UPDATE eugene_events SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
ALTER TABLE eugene_events ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to places  
ALTER TABLE places ADD COLUMN organization_id uuid REFERENCES organizations(id);
UPDATE places SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
ALTER TABLE places ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to points_of_interest
ALTER TABLE points_of_interest ADD COLUMN organization_id uuid REFERENCES organizations(id);
UPDATE points_of_interest SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
ALTER TABLE points_of_interest ALTER COLUMN organization_id SET NOT NULL;

-- Add RLS policies for organization-scoped access
CREATE POLICY "Users can view content in their organization" ON eugene_events FOR SELECT USING (
  is_active = true OR user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Users can manage content in their organization" ON eugene_events FOR ALL USING (
  user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Users can view places in their organization" ON places FOR SELECT USING (
  is_active = true OR user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Users can manage places in their organization" ON places FOR ALL USING (
  user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Users can view POIs in their organization" ON points_of_interest FOR SELECT USING (
  is_active = true OR user_belongs_to_organization(auth.uid(), organization_id)
);

CREATE POLICY "Users can manage POIs in their organization" ON points_of_interest FOR ALL USING (
  user_belongs_to_organization(auth.uid(), organization_id)
);