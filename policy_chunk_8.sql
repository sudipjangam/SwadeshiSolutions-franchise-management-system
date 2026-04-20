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