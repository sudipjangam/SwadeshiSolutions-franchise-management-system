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
