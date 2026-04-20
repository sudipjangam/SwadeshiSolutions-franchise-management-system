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
