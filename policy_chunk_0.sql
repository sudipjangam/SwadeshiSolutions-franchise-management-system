CREATE POLICY "Authenticated users can view components" ON public.app_components AS PERMISSIVE FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only system admins can manage components" ON public.app_components AS PERMISSIVE FOR ALL TO authenticated USING (has_any_role(auth.uid(), ARRAY['admin'::user_role, 'owner'::user_role]));

CREATE POLICY "Component-based audit_logs access" ON public.audit_logs AS PERMISSIVE FOR ALL TO authenticated USING (check_access('audit_logs'::text, restaurant_id)) WITH CHECK (check_access('audit_logs'::text, restaurant_id));

CREATE POLICY "Component-based backup_settings access" ON public.backup_settings AS PERMISSIVE FOR ALL TO authenticated USING (check_access('backup_settings'::text, restaurant_id)) WITH CHECK (check_access('backup_settings'::text, restaurant_id));

CREATE POLICY "Component-based backups access" ON public.backups AS PERMISSIVE FOR ALL TO authenticated USING (check_access('backups'::text, restaurant_id)) WITH CHECK (check_access('backups'::text, restaurant_id));

CREATE POLICY "Component-based batch_productions access" ON public.batch_productions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('batch_productions'::text, restaurant_id)) WITH CHECK (check_access('batch_productions'::text, restaurant_id));

CREATE POLICY "Component-based booking_channels access" ON public.booking_channels AS PERMISSIVE FOR ALL TO authenticated USING (check_access('booking_channels'::text, restaurant_id)) WITH CHECK (check_access('booking_channels'::text, restaurant_id));

CREATE POLICY "Component-based budget_line_items access" ON public.budget_line_items AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM budgets b
  WHERE ((b.id = budget_line_items.budget_id) AND check_access('budget_line_items'::text, b.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM budgets b
  WHERE ((b.id = budget_line_items.budget_id) AND check_access('budget_line_items'::text, b.restaurant_id)))));

CREATE POLICY "Component-based budgets access" ON public.budgets AS PERMISSIVE FOR ALL TO authenticated USING (check_access('budgets'::text, restaurant_id)) WITH CHECK (check_access('budgets'::text, restaurant_id));

CREATE POLICY categories_delete_by_managers ON public.categories AS PERMISSIVE FOR DELETE TO authenticated USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role])))))));

CREATE POLICY categories_insert_by_managers ON public.categories AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role])))))));

CREATE POLICY categories_select_for_restaurant ON public.categories AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));

CREATE POLICY categories_update_by_managers ON public.categories AS PERMISSIVE FOR UPDATE TO authenticated USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role, 'chef'::user_role]))))))) WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));

CREATE POLICY "Component-based channel_inventory access" ON public.channel_inventory AS PERMISSIVE FOR ALL TO authenticated USING (check_access('channel_inventory'::text, restaurant_id)) WITH CHECK (check_access('channel_inventory'::text, restaurant_id));

CREATE POLICY channel_rate_rules_delete ON public.channel_rate_rules AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_rate_rules_insert ON public.channel_rate_rules AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_rate_rules_select ON public.channel_rate_rules AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_rate_rules_update ON public.channel_rate_rules AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_restrictions_delete ON public.channel_restrictions AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_restrictions_insert ON public.channel_restrictions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_restrictions_select ON public.channel_restrictions AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_restrictions_update ON public.channel_restrictions AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_room_mapping_delete ON public.channel_room_mapping AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_room_mapping_insert ON public.channel_room_mapping AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_room_mapping_select ON public.channel_room_mapping AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY channel_room_mapping_update ON public.channel_room_mapping AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Component-based chart_of_accounts access" ON public.chart_of_accounts AS PERMISSIVE FOR ALL TO authenticated USING (check_access('chart_of_accounts'::text, restaurant_id)) WITH CHECK (check_access('chart_of_accounts'::text, restaurant_id));

CREATE POLICY "Component-based check_ins access" ON public.check_ins AS PERMISSIVE FOR ALL TO authenticated USING (check_access('check_ins'::text, restaurant_id)) WITH CHECK (check_access('check_ins'::text, restaurant_id));

CREATE POLICY "Component-based competitor_pricing access" ON public.competitor_pricing AS PERMISSIVE FOR ALL TO authenticated USING (check_access('competitor_pricing'::text, restaurant_id)) WITH CHECK (check_access('competitor_pricing'::text, restaurant_id));

CREATE POLICY "Admins can manage component_permissions" ON public.component_permissions AS PERMISSIVE FOR ALL TO public USING (user_is_admin_or_owner());

CREATE POLICY "Authenticated users can view component_permissions" ON public.component_permissions AS PERMISSIVE FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage component_table_mapping" ON public.component_table_mapping AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = ANY (ARRAY['admin'::user_role, 'owner'::user_role]))))));

CREATE POLICY "Authenticated users can read component_table_mapping" ON public.component_table_mapping AS PERMISSIVE FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view currencies" ON public.currencies AS PERMISSIVE FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only authenticated admins can manage currencies" ON public.currencies AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

CREATE POLICY "Component-based customer_activities access" ON public.customer_activities AS PERMISSIVE FOR ALL TO authenticated USING (check_access('customer_activities'::text, restaurant_id)) WITH CHECK (check_access('customer_activities'::text, restaurant_id));

CREATE POLICY "Component-based customer_notes access" ON public.customer_notes AS PERMISSIVE FOR ALL TO authenticated USING (check_access('customer_notes'::text, restaurant_id)) WITH CHECK (check_access('customer_notes'::text, restaurant_id));

CREATE POLICY "Public can create sessions for QR restaurants" ON public.customer_order_sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT restaurants.id
   FROM restaurants
  WHERE (restaurants.qr_ordering_enabled = true))));

CREATE POLICY "Public can update sessions" ON public.customer_order_sessions AS PERMISSIVE FOR UPDATE TO public USING ((expires_at > now()));

CREATE POLICY "Public can view active sessions" ON public.customer_order_sessions AS PERMISSIVE FOR SELECT TO public USING ((expires_at > now()));
