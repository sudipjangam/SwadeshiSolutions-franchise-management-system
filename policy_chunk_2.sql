CREATE POLICY "Update lost_found for restaurant" ON public.lost_found_items AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "View lost_found for restaurant" ON public.lost_found_items AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Anyone can enroll" ON public.loyalty_enrollments AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Users can manage enrollments for their restaurant" ON public.loyalty_enrollments AS PERMISSIVE FOR ALL TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view enrollments for their restaurant" ON public.loyalty_enrollments AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based loyalty_programs access" ON public.loyalty_programs AS PERMISSIVE FOR ALL TO authenticated USING (check_access('loyalty_programs'::text, restaurant_id)) WITH CHECK (check_access('loyalty_programs'::text, restaurant_id));

CREATE POLICY "Component-based loyalty_redemptions access" ON public.loyalty_redemptions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('loyalty_redemptions'::text, restaurant_id)) WITH CHECK (check_access('loyalty_redemptions'::text, restaurant_id));

CREATE POLICY "Component-based loyalty_rewards access" ON public.loyalty_rewards AS PERMISSIVE FOR ALL TO authenticated USING (check_access('loyalty_rewards'::text, restaurant_id)) WITH CHECK (check_access('loyalty_rewards'::text, restaurant_id));

CREATE POLICY "Component-based loyalty_tiers access" ON public.loyalty_tiers AS PERMISSIVE FOR ALL TO authenticated USING (check_access('loyalty_tiers'::text, restaurant_id)) WITH CHECK (check_access('loyalty_tiers'::text, restaurant_id));

CREATE POLICY "Component-based loyalty_transactions access" ON public.loyalty_transactions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('loyalty_transactions'::text, restaurant_id)) WITH CHECK (check_access('loyalty_transactions'::text, restaurant_id));

CREATE POLICY "Users can delete variants for their restaurant" ON public.menu_item_variants AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can insert variants for their restaurant" ON public.menu_item_variants AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can update variants for their restaurant" ON public.menu_item_variants AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view variants for their restaurant" ON public.menu_item_variants AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Allow anonymous read menu items for QR ordering" ON public.menu_items AS PERMISSIVE FOR SELECT TO anon USING (((restaurant_id IN ( SELECT restaurants.id
   FROM restaurants
  WHERE (restaurants.qr_ordering_enabled = true))) AND (is_available = true)));

CREATE POLICY "Users can delete menu_items from their restaurant" ON public.menu_items AS PERMISSIVE FOR DELETE TO authenticated USING ((restaurant_id IN ( SELECT p.restaurant_id
   FROM profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Users can insert menu_items for their restaurant" ON public.menu_items AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((restaurant_id IN ( SELECT p.restaurant_id
   FROM profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Users can update menu_items from their restaurant" ON public.menu_items AS PERMISSIVE FOR UPDATE TO authenticated USING ((restaurant_id IN ( SELECT p.restaurant_id
   FROM profiles p
  WHERE (p.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT p.restaurant_id
   FROM profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Users can view menu_items from their restaurant" ON public.menu_items AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id IN ( SELECT p.restaurant_id
   FROM profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Component-based monthly_budgets access" ON public.monthly_budgets AS PERMISSIVE FOR ALL TO authenticated USING (check_access('monthly_budgets'::text, restaurant_id)) WITH CHECK (check_access('monthly_budgets'::text, restaurant_id));

CREATE POLICY "Insert night_audit for restaurant" ON public.night_audit_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Update night_audit for restaurant" ON public.night_audit_logs AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "View night_audit for restaurant" ON public.night_audit_logs AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based operational_costs access" ON public.operational_costs AS PERMISSIVE FOR ALL TO authenticated USING (check_access('operational_costs'::text, restaurant_id)) WITH CHECK (check_access('operational_costs'::text, restaurant_id));

CREATE POLICY "Component-based orders access" ON public.orders AS PERMISSIVE FOR ALL TO authenticated USING (check_access('orders'::text, restaurant_id)) WITH CHECK (check_access('orders'::text, restaurant_id));

CREATE POLICY pos_delete_orders ON public.orders AS PERMISSIVE FOR DELETE TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY pos_insert_orders ON public.orders AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY pos_select_orders ON public.orders AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY pos_update_orders ON public.orders AS PERMISSIVE FOR UPDATE TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can delete orders from their restaurant" ON public.orders_unified AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can insert orders for their restaurant" ON public.orders_unified AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can update orders from their restaurant" ON public.orders_unified AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view orders from their restaurant" ON public.orders_unified AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_bookings_delete ON public.ota_bookings AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_bookings_insert ON public.ota_bookings AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_bookings_select ON public.ota_bookings AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_bookings_update ON public.ota_bookings AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_credentials_delete ON public.ota_credentials AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_credentials_insert ON public.ota_credentials AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY ota_credentials_select ON public.ota_credentials AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
