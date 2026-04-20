CREATE POLICY "Operational roles can update tables" ON public.restaurant_tables AS PERMISSIVE FOR UPDATE TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND user_has_role_or_permission(ARRAY['owner'::text, 'admin'::text, 'manager'::text, 'waiter'::text, 'staff'::text])));

CREATE POLICY "Users can view tables for their restaurant" ON public.restaurant_tables AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Admin can manage all restaurants" ON public.restaurants AS PERMISSIVE FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

CREATE POLICY "Admins can delete restaurants" ON public.restaurants AS PERMISSIVE FOR DELETE TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

CREATE POLICY "Admins can insert restaurants" ON public.restaurants AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));

CREATE POLICY "Admins can manage their restaurant" ON public.restaurants AS PERMISSIVE FOR ALL TO public USING (((id = get_user_restaurant_id(auth.uid())) AND user_is_admin_or_owner(auth.uid()))) WITH CHECK (((id = get_user_restaurant_id(auth.uid())) AND user_is_admin_or_owner(auth.uid())));

CREATE POLICY "Admins can update restaurants" ON public.restaurants AS PERMISSIVE FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));

CREATE POLICY "Admins can view all restaurants" ON public.restaurants AS PERMISSIVE FOR SELECT TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

CREATE POLICY "Allow anonymous read for QR ordering" ON public.restaurants AS PERMISSIVE FOR SELECT TO anon USING ((qr_ordering_enabled = true));

CREATE POLICY "Check active subscription for access" ON public.restaurants AS PERMISSIVE FOR ALL TO authenticated USING ((( SELECT has_active_subscription(restaurants.id) AS has_active_subscription) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))));

CREATE POLICY "Enable read access for authenticated users" ON public.restaurants AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR ((profiles.role = 'manager'::user_role) AND (profiles.restaurant_id = restaurants.id)))))));

CREATE POLICY "Enable write access for admins" ON public.restaurants AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

CREATE POLICY "Platform admin can manage all restaurants" ON public.restaurants AS PERMISSIVE FOR ALL TO authenticated USING ((is_platform_admin() = true)) WITH CHECK ((is_platform_admin() = true));

CREATE POLICY "Platform admin can view all restaurants" ON public.restaurants AS PERMISSIVE FOR SELECT TO authenticated USING ((is_platform_admin() = true));

CREATE POLICY "Users can insert restaurant data" ON public.restaurants AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Users can update their restaurant data" ON public.restaurants AS PERMISSIVE FOR UPDATE TO public USING ((id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view restaurant data" ON public.restaurants AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.restaurant_id = restaurants.id)))));

CREATE POLICY "Users can view their own restaurant" ON public.restaurants AS PERMISSIVE FOR SELECT TO public USING ((id = get_user_restaurant_id(auth.uid())));

CREATE POLICY "Users can view their restaurant data" ON public.restaurants AS PERMISSIVE FOR SELECT TO public USING ((id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based revenue_metrics access" ON public.revenue_metrics AS PERMISSIVE FOR ALL TO authenticated USING (check_access('revenue_metrics'::text, restaurant_id)) WITH CHECK (check_access('revenue_metrics'::text, restaurant_id));

CREATE POLICY revenue_metrics_policy ON public.revenue_metrics AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Admins and owners can manage role components" ON public.role_components AS PERMISSIVE FOR ALL TO public USING ((role_id IN ( SELECT roles.id
   FROM roles
  WHERE ((roles.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))) AND has_any_role(auth.uid(), ARRAY['admin'::user_role, 'owner'::user_role])))));

CREATE POLICY "Component-based role_components access" ON public.role_components AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM roles r
  WHERE ((r.id = role_components.role_id) AND check_access('role_components'::text, r.restaurant_id)))));

CREATE POLICY "Users can view role components for their restaurant" ON public.role_components AS PERMISSIVE FOR SELECT TO public USING ((role_id IN ( SELECT roles.id
   FROM roles
  WHERE (roles.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Admins and owners can manage roles" ON public.roles AS PERMISSIVE FOR ALL TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND has_any_role(auth.uid(), ARRAY['admin'::user_role, 'owner'::user_role])));

CREATE POLICY "Users can view roles for their restaurant" ON public.roles AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based room_amenities access" ON public.room_amenities AS PERMISSIVE FOR ALL TO authenticated USING (check_access('room_amenities'::text, restaurant_id)) WITH CHECK (check_access('room_amenities'::text, restaurant_id));

CREATE POLICY "Component-based room_amenity_inventory access" ON public.room_amenity_inventory AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM room_amenities ra
  WHERE ((ra.id = room_amenity_inventory.amenity_id) AND check_access('room_amenity_inventory'::text, ra.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM room_amenities ra
  WHERE ((ra.id = room_amenity_inventory.amenity_id) AND check_access('room_amenity_inventory'::text, ra.restaurant_id)))));

CREATE POLICY "Component-based room_billings access" ON public.room_billings AS PERMISSIVE FOR ALL TO authenticated USING (check_access('room_billings'::text, restaurant_id)) WITH CHECK (check_access('room_billings'::text, restaurant_id));

CREATE POLICY "Users can add room billings to their restaurant" ON public.room_billings AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can delete their restaurant's room billings" ON public.room_billings AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can update their restaurant's room billings" ON public.room_billings AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view their restaurant's room billings" ON public.room_billings AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based room_cleaning_schedules access" ON public.room_cleaning_schedules AS PERMISSIVE FOR ALL TO authenticated USING (check_access('room_cleaning_schedules'::text, restaurant_id)) WITH CHECK (check_access('room_cleaning_schedules'::text, restaurant_id));

CREATE POLICY "Allow authenticated users to insert room food orders" ON public.room_food_orders AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Allow users to delete their restaurant's food orders" ON public.room_food_orders AS PERMISSIVE FOR DELETE TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Allow users to update their restaurant's food orders" ON public.room_food_orders AS PERMISSIVE FOR UPDATE TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Allow users to view their restaurant's food orders" ON public.room_food_orders AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based room_food_orders access" ON public.room_food_orders AS PERMISSIVE FOR ALL TO authenticated USING (check_access('room_food_orders'::text, restaurant_id)) WITH CHECK (check_access('room_food_orders'::text, restaurant_id));

CREATE POLICY "Component-based room_maintenance_requests access" ON public.room_maintenance_requests AS PERMISSIVE FOR ALL TO authenticated USING (check_access('room_maintenance_requests'::text, restaurant_id)) WITH CHECK (check_access('room_maintenance_requests'::text, restaurant_id));
