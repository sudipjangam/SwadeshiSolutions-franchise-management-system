-- =============================================================
-- FRANCHISE ARCHITECTURE MIGRATIONS
-- Target: Franchise-based-RMS (bpheiklhiwwcrugmxivp)
-- Run these in ORDER on production when ready.
-- =============================================================

-- ============================================================
-- MIGRATION 1: create_organizations_table
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT DEFAULT 'single' CHECK (type IN ('single', 'franchise', 'chain')),
  owner_user_id UUID REFERENCES auth.users(id),
  logo_url TEXT,
  menu_mode TEXT DEFAULT 'independent' CHECK (menu_mode IN ('shared', 'independent', 'hybrid')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Temp policy — replaced after org_members table created
CREATE POLICY "org_owner_select" ON organizations
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "org_owner_update" ON organizations
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "org_insert" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- MIGRATION 2: create_organization_members_table
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  accessible_branches UUID[] DEFAULT NULL,  -- NULL = all branches
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select_own" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "members_insert" ON organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "members_update" ON organization_members
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "members_delete" ON organization_members
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Replace temp org policy with full one
DROP POLICY IF EXISTS "org_owner_select" ON organizations;
CREATE POLICY "org_members_select" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR owner_user_id = auth.uid()
  );

-- ============================================================
-- MIGRATION 3: add_org_columns_to_restaurants
-- ============================================================
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS branch_code TEXT,
  ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_restaurants_organization_id ON restaurants(organization_id);

-- ============================================================
-- MIGRATION 4: add_menu_origin_columns
-- ============================================================
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'branch' CHECK (origin IN ('master', 'branch', 'inherited')),
  ADD COLUMN IF NOT EXISTS source_item_id UUID REFERENCES menu_items(id),
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

CREATE INDEX IF NOT EXISTS idx_menu_items_source ON menu_items(source_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_org ON menu_items(organization_id);

COMMENT ON COLUMN menu_items.origin IS 'master = org-level template, branch = local only, inherited = copied from master (can override price/availability)';
COMMENT ON COLUMN menu_items.source_item_id IS 'For inherited items: points to the master menu_item this was derived from';

-- ============================================================
-- MIGRATION 5: create_org_subscriptions
-- ============================================================
-- Franchise Pricing Tiers:
-- free:         base=0,     per_branch=0,   max=1   (auto, single restaurant)
-- starter:      base=999,   per_branch=499, max=3
-- professional: base=2499,  per_branch=799, max=10
-- enterprise:   base=4999,  per_branch=599, max=unlimited (-1)
--
-- NOTE: Each branch ALSO keeps its own restaurant_subscriptions for module access.
-- Org sub = franchise tools access. Branch sub = restaurant module access.

CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'professional', 'enterprise')),
  max_branches INTEGER DEFAULT 1,
  base_price NUMERIC DEFAULT 0,
  per_branch_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  features JSONB DEFAULT '[]',
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_sub_select" ON organization_subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_sub_manage" ON organization_subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- MIGRATION 6: create_rls_helper_function
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_accessible_restaurants(p_user_id UUID)
RETURNS UUID[] AS $$
  SELECT COALESCE(
    (SELECT CASE 
      WHEN om.accessible_branches IS NOT NULL THEN om.accessible_branches
      ELSE (SELECT ARRAY_AGG(r.id) FROM restaurants r WHERE r.organization_id = om.organization_id)
    END
    FROM organization_members om
    WHERE om.user_id = p_user_id
    LIMIT 1),
    ARRAY[(SELECT restaurant_id FROM profiles WHERE id = p_user_id)]
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- MIGRATION 7: data_migration_auto_create_orgs
-- CAUTION: Run only once. Idempotent — uses WHERE organization_id IS NULL.
-- ============================================================

-- Auto-create orgs for existing restaurants
INSERT INTO organizations (name, type, owner_user_id, menu_mode)
SELECT 
  r.name, 
  'single', 
  (SELECT p.id FROM profiles p WHERE p.restaurant_id = r.id AND p.role = 'owner' LIMIT 1),
  'independent'
FROM restaurants r
WHERE r.organization_id IS NULL;

-- Link restaurants to their auto-created orgs
UPDATE restaurants r
SET organization_id = o.id, is_headquarters = true
FROM organizations o
WHERE o.name = r.name AND r.organization_id IS NULL;

-- Create org_member entries for all existing users
INSERT INTO organization_members (organization_id, user_id, role)
SELECT 
  r.organization_id, 
  p.id, 
  CASE WHEN p.role = 'owner' THEN 'owner' ELSE 'member' END
FROM profiles p
JOIN restaurants r ON r.id = p.restaurant_id
WHERE r.organization_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Auto-create free org subscriptions
INSERT INTO organization_subscriptions (organization_id, plan_type, max_branches, base_price, per_branch_price)
SELECT id, 'free', 1, 0, 0
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM organization_subscriptions);
