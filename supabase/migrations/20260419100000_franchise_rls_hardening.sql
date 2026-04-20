-- ============================================================================
-- MIGRATION: Phase 9 - RLS Hardening for Multi-Branch
-- Date: 2026-04-19
-- ============================================================================

-- 1. Create a helper function to get all branch IDs a user can access
CREATE OR REPLACE FUNCTION public.get_user_accessible_restaurants(p_user_id uuid DEFAULT auth.uid())
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- 1. Branches from organization where user is owner/admin
  SELECT r.id
  FROM restaurants r
  JOIN organization_members om ON r.organization_id = om.organization_id
  WHERE om.user_id = p_user_id AND om.role IN ('owner', 'admin')
  UNION
  -- 2. Direct branch assigned to user profile
  SELECT restaurant_id as id
  FROM profiles
  WHERE id = p_user_id AND restaurant_id IS NOT NULL;
$$;

-- 2. Update the check_access helper used by most tables (orders, inventory, expenses, etc.)
CREATE OR REPLACE FUNCTION public.check_access(_table_name text, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $function$
 SELECT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND _restaurant_id IN (SELECT public.get_user_accessible_restaurants(auth.uid()))
    AND (
      -- Has full role access
      EXISTS (SELECT 1 FROM public.roles r WHERE r.id = p.role_id AND r.has_full_access = true) 
      OR 
      -- Has component-specific access
      EXISTS (SELECT 1 FROM public.role_components rc JOIN public.component_table_mapping ctm ON ctm.component_id = rc.component_id WHERE rc.role_id = p.role_id AND ctm.table_name = _table_name)
      OR
      -- Or is an owner/admin of the organization owning this branch
      EXISTS (
        SELECT 1 FROM organization_members om
        JOIN restaurants r ON r.organization_id = om.organization_id
        WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND r.id = _restaurant_id
      )
    )
 )
$function$;

-- 3. Fix menu_items policies directly (as they didn't use check_access for everything)
DROP POLICY IF EXISTS "Users can view menu_items from their restaurant" ON menu_items;
CREATE POLICY "Users can view menu_items from their restaurant" ON menu_items
  FOR SELECT TO authenticated
  USING (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

DROP POLICY IF EXISTS "Users can insert menu_items for their restaurant" ON menu_items;
CREATE POLICY "Users can insert menu_items for their restaurant" ON menu_items
  FOR INSERT TO authenticated
  WITH CHECK (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

DROP POLICY IF EXISTS "Users can update menu_items from their restaurant" ON menu_items;
CREATE POLICY "Users can update menu_items from their restaurant" ON menu_items
  FOR UPDATE TO authenticated
  USING (restaurant_id IN (SELECT public.get_user_accessible_restaurants()))
  WITH CHECK (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

DROP POLICY IF EXISTS "Users can delete menu_items from their restaurant" ON menu_items;
CREATE POLICY "Users can delete menu_items from their restaurant" ON menu_items
  FOR DELETE TO authenticated
  USING (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

-- 4. Fix categories policies
DROP POLICY IF EXISTS "categories_select_for_restaurant" ON categories;
CREATE POLICY "categories_select_for_restaurant" ON categories
  FOR SELECT TO authenticated
  USING (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

DROP POLICY IF EXISTS "categories_insert_by_managers" ON categories;
CREATE POLICY "categories_insert_by_managers" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (
    restaurant_id IN (SELECT public.get_user_accessible_restaurants())
    AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
        AND profiles.role = ANY(ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role])
      )
      OR EXISTS (
        SELECT 1 FROM organization_members om JOIN restaurants r ON r.organization_id = om.organization_id
        WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND r.id = restaurant_id
      )
    )
  );

DROP POLICY IF EXISTS "categories_update_by_managers" ON categories;
CREATE POLICY "categories_update_by_managers" ON categories
  FOR UPDATE TO authenticated
  USING (
    restaurant_id IN (SELECT public.get_user_accessible_restaurants())
    AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
        AND profiles.role = ANY(ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role])
      )
      OR EXISTS (
        SELECT 1 FROM organization_members om JOIN restaurants r ON r.organization_id = om.organization_id
        WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND r.id = restaurant_id
      )
    )
  )
  WITH CHECK (restaurant_id IN (SELECT public.get_user_accessible_restaurants()));

DROP POLICY IF EXISTS "categories_delete_by_managers" ON categories;
CREATE POLICY "categories_delete_by_managers" ON categories
  FOR DELETE TO authenticated
  USING (
    restaurant_id IN (SELECT public.get_user_accessible_restaurants())
    AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
        AND profiles.role = ANY(ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role])
      )
      OR EXISTS (
        SELECT 1 FROM organization_members om JOIN restaurants r ON r.organization_id = om.organization_id
        WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND r.id = restaurant_id
      )
    )
  );
