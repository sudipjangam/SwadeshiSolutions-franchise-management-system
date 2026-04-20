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
