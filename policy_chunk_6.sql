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
