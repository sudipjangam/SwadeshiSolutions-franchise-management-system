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
CREATE POLICY "Staff can view all sessions" ON public.customer_order_sessions AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based customers access" ON public.customers AS PERMISSIVE FOR ALL TO authenticated USING (check_access('customers'::text, restaurant_id)) WITH CHECK (check_access('customers'::text, restaurant_id));
CREATE POLICY "Component-based daily_revenue_stats access" ON public.daily_revenue_stats AS PERMISSIVE FOR ALL TO authenticated USING (check_access('daily_revenue_stats'::text, restaurant_id)) WITH CHECK (check_access('daily_revenue_stats'::text, restaurant_id));
CREATE POLICY "Users can insert own restaurant reports" ON public.daily_summary_reports AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update own restaurant reports" ON public.daily_summary_reports AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view own restaurant reports" ON public.daily_summary_reports AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can delete own restaurant categories" ON public.expense_categories AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can insert own restaurant categories" ON public.expense_categories AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can update own restaurant categories" ON public.expense_categories AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can view own restaurant categories" ON public.expense_categories AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Component-based expenses access" ON public.expenses AS PERMISSIVE FOR ALL TO authenticated USING (check_access('expenses'::text, restaurant_id)) WITH CHECK (check_access('expenses'::text, restaurant_id));
CREATE POLICY "Component-based financial_reports access" ON public.financial_reports AS PERMISSIVE FOR ALL TO authenticated USING (check_access('financial_reports'::text, restaurant_id)) WITH CHECK (check_access('financial_reports'::text, restaurant_id));
CREATE POLICY "Component-based guest_feedback access" ON public.guest_feedback AS PERMISSIVE FOR ALL TO authenticated USING (check_access('guest_feedback'::text, restaurant_id)) WITH CHECK (check_access('guest_feedback'::text, restaurant_id));
CREATE POLICY "Users can delete guest_loyalty for their restaurant" ON public.guest_loyalty AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can insert guest_loyalty for their restaurant" ON public.guest_loyalty AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update guest_loyalty for their restaurant" ON public.guest_loyalty AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view guest_loyalty for their restaurant" ON public.guest_loyalty AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based guest_preferences access" ON public.guest_preferences AS PERMISSIVE FOR ALL TO authenticated USING (check_access('guest_preferences'::text, restaurant_id)) WITH CHECK (check_access('guest_preferences'::text, restaurant_id));
CREATE POLICY "Users can delete guest_preferences for their restaurant" ON public.guest_preferences AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can insert guest_preferences for their restaurant" ON public.guest_preferences AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update guest_preferences for their restaurant" ON public.guest_preferences AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view guest_preferences for their restaurant" ON public.guest_preferences AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based guest_profiles access" ON public.guest_profiles AS PERMISSIVE FOR ALL TO authenticated USING (check_access('guest_profiles'::text, restaurant_id)) WITH CHECK (check_access('guest_profiles'::text, restaurant_id));
CREATE POLICY "Component-based inventory_alerts access" ON public.inventory_alerts AS PERMISSIVE FOR ALL TO authenticated USING (check_access('inventory_alerts'::text, restaurant_id)) WITH CHECK (check_access('inventory_alerts'::text, restaurant_id));
CREATE POLICY "Component-based inventory_items access" ON public.inventory_items AS PERMISSIVE FOR ALL TO authenticated USING (check_access('inventory_items'::text, restaurant_id)) WITH CHECK (check_access('inventory_items'::text, restaurant_id));
CREATE POLICY "Users can insert lots for their restaurant" ON public.inventory_lots AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update lots for their restaurant" ON public.inventory_lots AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view their restaurant lots" ON public.inventory_lots AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based inventory_transactions access" ON public.inventory_transactions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('inventory_transactions'::text, restaurant_id)) WITH CHECK (check_access('inventory_transactions'::text, restaurant_id));
CREATE POLICY "Component-based invoice_line_items access" ON public.invoice_line_items AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_line_items.invoice_id) AND check_access('invoice_line_items'::text, i.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_line_items.invoice_id) AND check_access('invoice_line_items'::text, i.restaurant_id)))));
CREATE POLICY "Component-based invoices access" ON public.invoices AS PERMISSIVE FOR ALL TO authenticated USING (check_access('invoices'::text, restaurant_id)) WITH CHECK (check_access('invoices'::text, restaurant_id));
CREATE POLICY "Component-based journal_entries access" ON public.journal_entries AS PERMISSIVE FOR ALL TO authenticated USING (check_access('journal_entries'::text, restaurant_id)) WITH CHECK (check_access('journal_entries'::text, restaurant_id));
CREATE POLICY "Component-based journal_entry_lines access" ON public.journal_entry_lines AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM journal_entries je
  WHERE ((je.id = journal_entry_lines.journal_entry_id) AND check_access('journal_entry_lines'::text, je.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM journal_entries je
  WHERE ((je.id = journal_entry_lines.journal_entry_id) AND check_access('journal_entry_lines'::text, je.restaurant_id)))));
CREATE POLICY "Component-based kitchen_orders access" ON public.kitchen_orders AS PERMISSIVE FOR ALL TO authenticated USING (check_access('kitchen_orders'::text, restaurant_id)) WITH CHECK (check_access('kitchen_orders'::text, restaurant_id));
CREATE POLICY pos_delete_kitchen_orders ON public.kitchen_orders AS PERMISSIVE FOR DELETE TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pos_insert_kitchen_orders ON public.kitchen_orders AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pos_select_kitchen_orders ON public.kitchen_orders AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pos_update_kitchen_orders ON public.kitchen_orders AS PERMISSIVE FOR UPDATE TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Delete lost_found for restaurant" ON public.lost_found_items AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Insert lost_found for restaurant" ON public.lost_found_items AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
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
CREATE POLICY ota_credentials_update ON public.ota_credentials AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY owner_notifications_restaurant_access ON public.owner_notifications AS PERMISSIVE FOR ALL TO authenticated USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based payment_methods access" ON public.payment_methods AS PERMISSIVE FOR ALL TO authenticated USING (check_access('payment_methods'::text, restaurant_id)) WITH CHECK (check_access('payment_methods'::text, restaurant_id));
CREATE POLICY "All restaurant staff can read payment_settings" ON public.payment_settings AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.restaurant_id = payment_settings.restaurant_id)))));
CREATE POLICY "Component-based payment_settings access" ON public.payment_settings AS PERMISSIVE FOR ALL TO authenticated USING (check_access('payment_settings'::text, restaurant_id)) WITH CHECK (check_access('payment_settings'::text, restaurant_id));
CREATE POLICY payment_transactions_insert_own ON public.payment_transactions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY payment_transactions_select_own ON public.payment_transactions AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY payment_transactions_service_role ON public.payment_transactions AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY payment_transactions_update_own ON public.payment_transactions AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based payments access" ON public.payments AS PERMISSIVE FOR ALL TO authenticated USING (check_access('payments'::text, restaurant_id)) WITH CHECK (check_access('payments'::text, restaurant_id));
CREATE POLICY pool_inventory_delete ON public.pool_inventory AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pool_inventory_insert ON public.pool_inventory AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pool_inventory_select ON public.pool_inventory AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY pool_inventory_update ON public.pool_inventory AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant members can delete transactions" ON public.pos_transactions AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant members can insert transactions" ON public.pos_transactions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant members can update transactions" ON public.pos_transactions AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant members can view transactions" ON public.pos_transactions AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based pricing_rules access" ON public.pricing_rules AS PERMISSIVE FOR ALL TO authenticated USING (check_access('pricing_rules'::text, restaurant_id)) WITH CHECK (check_access('pricing_rules'::text, restaurant_id));
CREATE POLICY "Admin can manage all profiles" ON public.profiles AS PERMISSIVE FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles AS PERMISSIVE FOR DELETE TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Admins can delete profiles in restaurant" ON public.profiles AS PERMISSIVE FOR DELETE TO public USING (((get_user_restaurant_id(auth.uid()) = restaurant_id) AND user_is_admin_or_owner(auth.uid())));
CREATE POLICY "Admins can insert profiles" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Admins can insert profiles in restaurant" ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK (((get_user_restaurant_id(auth.uid()) = restaurant_id) AND user_is_admin_or_owner(auth.uid())));
CREATE POLICY "Admins can update profiles" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Admins can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Enable read access for authenticated users" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (((auth.uid() = id) OR (role = 'admin'::user_role)));
CREATE POLICY "Enable write access for admins" ON public.profiles AS PERMISSIVE FOR ALL TO authenticated USING ((role = 'admin'::user_role)) WITH CHECK ((role = 'admin'::user_role));
CREATE POLICY "Platform admin can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((is_platform_admin() = true));
CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update their own profile only" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));
CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = id));
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING (((id = auth.uid()) OR ((get_user_restaurant_id(auth.uid()) = restaurant_id) AND user_is_admin_or_owner(auth.uid()))));
CREATE POLICY "Users can delete promotions for their restaurant" ON public.promotion_campaigns AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.restaurant_id = promotion_campaigns.restaurant_id))));
CREATE POLICY "Users can insert promotions for their restaurant" ON public.promotion_campaigns AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.restaurant_id = promotion_campaigns.restaurant_id))));
CREATE POLICY "Users can update promotions for their restaurant" ON public.promotion_campaigns AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.restaurant_id = promotion_campaigns.restaurant_id))));
CREATE POLICY "Users can view promotions for their restaurant" ON public.promotion_campaigns AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.restaurant_id = promotion_campaigns.restaurant_id))));
CREATE POLICY "Component-based purchase_order_items access" ON public.purchase_order_items AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.purchase_order_id) AND check_access('purchase_order_items'::text, po.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM purchase_orders po
  WHERE ((po.id = purchase_order_items.purchase_order_id) AND check_access('purchase_order_items'::text, po.restaurant_id)))));
CREATE POLICY "Users can insert purchase order items for their restaurant" ON public.purchase_order_items AS PERMISSIVE FOR INSERT TO public WITH CHECK ((purchase_order_id IN ( SELECT purchase_orders.id
   FROM purchase_orders
  WHERE (purchase_orders.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Users can update purchase order items for their restaurant" ON public.purchase_order_items AS PERMISSIVE FOR UPDATE TO public USING ((purchase_order_id IN ( SELECT purchase_orders.id
   FROM purchase_orders
  WHERE (purchase_orders.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Users can view purchase order items for their restaurant" ON public.purchase_order_items AS PERMISSIVE FOR SELECT TO public USING ((purchase_order_id IN ( SELECT purchase_orders.id
   FROM purchase_orders
  WHERE (purchase_orders.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Component-based purchase_orders access" ON public.purchase_orders AS PERMISSIVE FOR ALL TO authenticated USING (check_access('purchase_orders'::text, restaurant_id)) WITH CHECK (check_access('purchase_orders'::text, restaurant_id));
CREATE POLICY "Users can insert purchase orders for their restaurant" ON public.purchase_orders AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update purchase orders for their restaurant" ON public.purchase_orders AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view purchase orders for their restaurant" ON public.purchase_orders AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can manage their restaurant's QR codes" ON public.qr_codes AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view their restaurant's QR codes" ON public.qr_codes AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY rate_parity_checks_delete ON public.rate_parity_checks AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY rate_parity_checks_insert ON public.rate_parity_checks AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY rate_parity_checks_select ON public.rate_parity_checks AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY rate_parity_checks_update ON public.rate_parity_checks AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based rate_plans access" ON public.rate_plans AS PERMISSIVE FOR ALL TO authenticated USING (check_access('rate_plans'::text, restaurant_id)) WITH CHECK (check_access('rate_plans'::text, restaurant_id));
CREATE POLICY rate_plans_policy ON public.rate_plans AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based recipe_ingredients access" ON public.recipe_ingredients AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM recipes r
  WHERE ((r.id = recipe_ingredients.recipe_id) AND check_access('recipe_ingredients'::text, r.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM recipes r
  WHERE ((r.id = recipe_ingredients.recipe_id) AND check_access('recipe_ingredients'::text, r.restaurant_id)))));
CREATE POLICY "Users can manage recipe ingredients" ON public.recipe_ingredients AS PERMISSIVE FOR ALL TO public USING ((recipe_id IN ( SELECT recipes.id
   FROM recipes
  WHERE (recipes.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Users can view recipe ingredients" ON public.recipe_ingredients AS PERMISSIVE FOR SELECT TO public USING ((recipe_id IN ( SELECT recipes.id
   FROM recipes
  WHERE (recipes.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Users can create recipes for their restaurant" ON public.recipes AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can delete recipes for their restaurant" ON public.recipes AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update recipes for their restaurant" ON public.recipes AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view recipes for their restaurant" ON public.recipes AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Management roles can delete reservations" ON public.reservations AS PERMISSIVE FOR DELETE TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND user_has_role_or_permission(ARRAY['owner'::text, 'admin'::text, 'manager'::text])));
CREATE POLICY "Operational roles can update reservations" ON public.reservations AS PERMISSIVE FOR UPDATE TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND user_has_role_or_permission(ARRAY['owner'::text, 'admin'::text, 'manager'::text, 'waiter'::text, 'staff'::text])));
CREATE POLICY "Users can create reservations for their restaurant" ON public.reservations AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view reservations for their restaurant" ON public.reservations AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based restaurant_operating_hours access" ON public.restaurant_operating_hours AS PERMISSIVE FOR ALL TO authenticated USING (check_access('restaurant_operating_hours'::text, restaurant_id)) WITH CHECK (check_access('restaurant_operating_hours'::text, restaurant_id));
CREATE POLICY "Users can manage operating hours for their restaurant" ON public.restaurant_operating_hours AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view operating hours for their restaurant" ON public.restaurant_operating_hours AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based restaurant_settings access" ON public.restaurant_settings AS PERMISSIVE FOR ALL TO authenticated USING (check_access('restaurant_settings'::text, restaurant_id)) WITH CHECK (check_access('restaurant_settings'::text, restaurant_id));
CREATE POLICY restaurant_settings_policy ON public.restaurant_settings AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Admin can manage restaurant_subscriptions" ON public.restaurant_subscriptions AS PERMISSIVE FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "Allow admin to manage all subscriptions" ON public.restaurant_subscriptions AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));
CREATE POLICY "Component-based restaurant_subscriptions access" ON public.restaurant_subscriptions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('restaurant_subscriptions'::text, restaurant_id)) WITH CHECK (check_access('restaurant_subscriptions'::text, restaurant_id));
CREATE POLICY "Platform admin can manage all subscriptions" ON public.restaurant_subscriptions AS PERMISSIVE FOR ALL TO authenticated USING ((is_platform_admin() = true)) WITH CHECK ((is_platform_admin() = true));
CREATE POLICY "Platform admin can view all subscriptions" ON public.restaurant_subscriptions AS PERMISSIVE FOR SELECT TO authenticated USING ((is_platform_admin() = true));
CREATE POLICY "Users can manage their restaurant subscription" ON public.restaurant_subscriptions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.restaurant_id = restaurant_subscriptions.restaurant_id) OR (profiles.role = 'admin'::user_role))))));
CREATE POLICY "Users can update their restaurant subscription" ON public.restaurant_subscriptions AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.restaurant_id = restaurant_subscriptions.restaurant_id) OR (profiles.role = 'admin'::user_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.restaurant_id = restaurant_subscriptions.restaurant_id) OR (profiles.role = 'admin'::user_role))))));
CREATE POLICY "Users can view restaurant subscriptions" ON public.restaurant_subscriptions AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.restaurant_id = restaurant_subscriptions.restaurant_id)))));
CREATE POLICY "Users can view their restaurant subscription" ON public.restaurant_subscriptions AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.restaurant_id = restaurant_subscriptions.restaurant_id) OR (profiles.role = 'admin'::user_role))))));
CREATE POLICY "Management roles can delete tables" ON public.restaurant_tables AS PERMISSIVE FOR DELETE TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND user_has_role_or_permission(ARRAY['owner'::text, 'admin'::text, 'manager'::text])));
CREATE POLICY "Operational roles can create tables" ON public.restaurant_tables AS PERMISSIVE FOR INSERT TO public WITH CHECK (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))) AND user_has_role_or_permission(ARRAY['owner'::text, 'admin'::text, 'manager'::text])));
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
CREATE POLICY "Insert room_moves for restaurant" ON public.room_moves AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "View room_moves for restaurant" ON public.room_moves AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can delete room_waitlist for their restaurant" ON public.room_waitlist AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can insert room_waitlist for their restaurant" ON public.room_waitlist AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update room_waitlist for their restaurant" ON public.room_waitlist AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view room_waitlist for their restaurant" ON public.room_waitlist AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant-specific access" ON public.rooms AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR ((profiles.role = 'manager'::user_role) AND (profiles.restaurant_id = rooms.restaurant_id)))))));
CREATE POLICY "Users can add rooms to their restaurant" ON public.rooms AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can delete their restaurant's rooms" ON public.rooms AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update their restaurant's rooms" ON public.rooms AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view their restaurant's rooms" ON public.rooms AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Component-based sent_promotions access" ON public.sent_promotions AS PERMISSIVE FOR ALL TO authenticated USING (check_access('sent_promotions'::text, restaurant_id)) WITH CHECK (check_access('sent_promotions'::text, restaurant_id));
CREATE POLICY "Anyone can view shared bill by short_id" ON public.shared_bills AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create shared bills" ON public.shared_bills AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY shifts_delete_policy ON public.shifts AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY shifts_insert_policy ON public.shifts AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY shifts_select_policy ON public.shifts AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY shifts_update_policy ON public.shifts AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Insert split_bill_portions" ON public.split_bill_portions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((split_bill_id IN ( SELECT split_bills.id
   FROM split_bills
  WHERE (split_bills.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Update split_bill_portions" ON public.split_bill_portions AS PERMISSIVE FOR UPDATE TO public USING ((split_bill_id IN ( SELECT split_bills.id
   FROM split_bills
  WHERE (split_bills.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "View split_bill_portions" ON public.split_bill_portions AS PERMISSIVE FOR SELECT TO public USING ((split_bill_id IN ( SELECT split_bills.id
   FROM split_bills
  WHERE (split_bills.restaurant_id IN ( SELECT profiles.restaurant_id
           FROM profiles
          WHERE (profiles.id = auth.uid()))))));
CREATE POLICY "Insert split_bills for restaurant" ON public.split_bills AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "View split_bills for restaurant" ON public.split_bills AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Staff self-access and component-based access" ON public.staff AS PERMISSIVE FOR ALL TO authenticated USING ((check_access('staff'::text, restaurant_id) OR ((email = auth.email()) AND (restaurant_id = get_user_restaurant_id())))) WITH CHECK (check_access('staff'::text, restaurant_id));
CREATE POLICY "Users can manage their restaurant's staff documents" ON public.staff_documents AS PERMISSIVE FOR ALL TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Staff self-leave-balances and component-based access" ON public.staff_leave_balances AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_balances.staff_id) AND check_access('staff_leave_balances'::text, s.restaurant_id)))) OR (EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_balances.staff_id) AND (s.email = auth.email()) AND (s.restaurant_id = get_user_restaurant_id())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_balances.staff_id) AND check_access('staff_leave_balances'::text, s.restaurant_id)))));
CREATE POLICY "Staff self-leave-requests and component-based access" ON public.staff_leave_requests AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_requests.staff_id) AND check_access('staff_leave_requests'::text, s.restaurant_id)))) OR (EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_requests.staff_id) AND (s.email = auth.email()) AND (s.restaurant_id = get_user_restaurant_id())))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_requests.staff_id) AND check_access('staff_leave_requests'::text, s.restaurant_id)))) OR (EXISTS ( SELECT 1
   FROM staff s
  WHERE ((s.id = staff_leave_requests.staff_id) AND (s.email = auth.email()) AND (s.restaurant_id = get_user_restaurant_id()))))));
CREATE POLICY "Staff can read leave types" ON public.staff_leave_types AS PERMISSIVE FOR SELECT TO authenticated USING ((restaurant_id = get_user_restaurant_id()));
CREATE POLICY "Component-based staff_leaves access" ON public.staff_leaves AS PERMISSIVE FOR ALL TO authenticated USING (check_access('staff_leaves'::text, restaurant_id)) WITH CHECK (check_access('staff_leaves'::text, restaurant_id));
CREATE POLICY "Users can delete their restaurant's staff leaves" ON public.staff_leaves AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can insert their restaurant's staff leaves" ON public.staff_leaves AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can update their restaurant's staff leaves" ON public.staff_leaves AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Users can view their restaurant's staff leaves" ON public.staff_leaves AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Restaurant staff can insert notifications" ON public.staff_notifications AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Staff can update own notifications" ON public.staff_notifications AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY "Staff can view own notifications" ON public.staff_notifications AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY staff_shift_assignments_delete_policy ON public.staff_shift_assignments AS PERMISSIVE FOR DELETE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY staff_shift_assignments_insert_policy ON public.staff_shift_assignments AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY staff_shift_assignments_select_policy ON public.staff_shift_assignments AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
CREATE POLICY staff_shift_assignments_update_policy ON public.staff_shift_assignments AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = auth.uid()))));
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
CREATE POLICY "Users can view own restaurant wa sends" ON public.whatsapp_campaign_sends AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Platform admins can update all templates" ON public.whatsapp_templates AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::user_role)))));
CREATE POLICY "Platform admins can view all templates" ON public.whatsapp_templates AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::user_role)))));
CREATE POLICY "Users can delete own restaurant templates" ON public.whatsapp_templates AS PERMISSIVE FOR DELETE TO public USING (((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))) AND (is_default = false)));
CREATE POLICY "Users can insert own restaurant templates" ON public.whatsapp_templates AS PERMISSIVE FOR INSERT TO public WITH CHECK ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can update own restaurant templates" ON public.whatsapp_templates AS PERMISSIVE FOR UPDATE TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can view own restaurant templates" ON public.whatsapp_templates AS PERMISSIVE FOR SELECT TO public USING ((restaurant_id IN ( SELECT profiles.restaurant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));