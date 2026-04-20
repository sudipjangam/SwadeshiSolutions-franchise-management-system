CREATE POLICY "Component-based staff_shifts access" ON public.staff_shifts AS PERMISSIVE FOR ALL TO authenticated USING (check_access('staff_shifts'::text, restaurant_id)) WITH CHECK (check_access('staff_shifts'::text, restaurant_id));

CREATE POLICY "Staff self-clock and component-based access" ON public.staff_time_clock AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_time_clock.staff_id) AND check_access('staff_time_clock'::text, s.restaurant_id)))) OR (EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_time_clock.staff_id) AND (s.email = auth.email()) AND (s.restaurant_id = get_user_restaurant_id())))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_time_clock.staff_id) AND check_access('staff_time_clock'::text, s.restaurant_id)))) OR (EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_time_clock.staff_id) AND (s.email = auth.email()) AND (s.restaurant_id = get_user_restaurant_id()))))));

CREATE POLICY "Users can manage own storage locations" ON public.storage_locations AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Admin can manage subscription_plans" ON public.subscription_plans AS PERMISSIVE FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

CREATE POLICY "Allow admin to manage subscription_plans" ON public.subscription_plans AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans AS PERMISSIVE FOR SELECT TO authenticated USING ((is_active = true));

CREATE POLICY "Authenticated users can view subscription plans" ON public.subscription_plans AS PERMISSIVE FOR SELECT TO authenticated USING (true);

CREATE POLICY "Platform admin can view subscription_plans" ON public.subscription_plans AS PERMISSIVE FOR SELECT TO authenticated USING ((is_platform_admin() = true));

CREATE POLICY "Component-based supplier_order_items access" ON public.supplier_order_items AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM supplier_orders so
  WHERE ((so.id = supplier_order_items.order_id) AND check_access('supplier_order_items'::text, so.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM supplier_orders so
  WHERE ((so.id = supplier_order_items.order_id) AND check_access('supplier_order_items'::text, so.restaurant_id)))));

CREATE POLICY "Restaurant-specific access" ON public.supplier_order_items AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR ((profiles.role = 'manager'::user_role) AND (profiles.restaurant_id = ( SELECT supplier_orders.restaurant_id
           FROM supplier_orders
          WHERE (supplier_orders.id = supplier_order_items.order_id)))))))));

CREATE POLICY "Component-based supplier_orders access" ON public.supplier_orders AS PERMISSIVE FOR ALL TO authenticated USING (check_access('supplier_orders'::text, restaurant_id)) WITH CHECK (check_access('supplier_orders'::text, restaurant_id));

CREATE POLICY "Restaurant-specific access" ON public.supplier_orders AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR ((profiles.role = 'manager'::user_role) AND (profiles.restaurant_id = supplier_orders.restaurant_id)))))));

CREATE POLICY "Users can manage own supplier price history" ON public.supplier_price_history AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Restaurant-specific access" ON public.suppliers AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR ((profiles.role = 'manager'::user_role) AND (profiles.restaurant_id = suppliers.restaurant_id)))))));

CREATE POLICY "Users can insert suppliers for their restaurant" ON public.suppliers AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can update suppliers for their restaurant" ON public.suppliers AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view suppliers for their restaurant" ON public.suppliers AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_logs_delete ON public.sync_logs AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_logs_insert ON public.sync_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_logs_select ON public.sync_logs AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_logs_update ON public.sync_logs AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_retry_queue_delete ON public.sync_retry_queue AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_retry_queue_insert ON public.sync_retry_queue AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_retry_queue_select ON public.sync_retry_queue AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY sync_retry_queue_update ON public.sync_retry_queue AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can manage availability slots for their restaurant" ON public.table_availability_slots AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view availability slots for their restaurant" ON public.table_availability_slots AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based table_reservations access" ON public.table_reservations AS PERMISSIVE FOR ALL TO authenticated USING (check_access('table_reservations'::text, restaurant_id)) WITH CHECK (check_access('table_reservations'::text, restaurant_id));

CREATE POLICY "Users can create reservations for their restaurant" ON public.table_reservations AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can delete reservations for their restaurant" ON public.table_reservations AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can update reservations for their restaurant" ON public.table_reservations AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view reservations for their restaurant" ON public.table_reservations AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY tax_configurations_policy ON public.tax_configurations AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Admins and owners can manage roles" ON public.user_roles AS PERMISSIVE FOR ALL TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND has_any_role(auth.uid(), ARRAY['admin'::user_role, 'owner'::user_role])));

CREATE POLICY "Admins manage user_roles" ON public.user_roles AS PERMISSIVE FOR ALL TO public USING (((restaurant_id = get_user_restaurant_id(auth.uid())) AND user_is_admin_or_owner(auth.uid()))) WITH CHECK (((restaurant_id = get_user_restaurant_id(auth.uid())) AND user_is_admin_or_owner(auth.uid())));

CREATE POLICY "Users can view roles in their restaurant" ON public.user_roles AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users view own roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO public USING ((user_id = auth.uid()));

CREATE POLICY "Component-based waitlist access" ON public.waitlist AS PERMISSIVE FOR ALL TO authenticated USING (check_access('waitlist'::text, restaurant_id)) WITH CHECK (check_access('waitlist'::text, restaurant_id));

CREATE POLICY "Users can insert own restaurant wa sends" ON public.whatsapp_campaign_sends AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));

CREATE POLICY "Users can update own restaurant wa sends" ON public.whatsapp_campaign_sends AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
