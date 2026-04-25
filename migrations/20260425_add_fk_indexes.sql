-- ============================================================
-- Migration: Add FK Indexes on All Unindexed Foreign Key Columns
-- Date: 2026-04-25
-- Purpose: Performance optimization — ensures every FK column
--          has a B-tree index for fast RLS policy checks, joins,
--          and tenant-scoped queries.
-- Safety: All CREATE INDEX IF NOT EXISTS — safe to re-run.
-- Impact: Zero downtime, no table locks, no data changes.
-- ============================================================

BEGIN;

-- ==================== TIER 1: HOT PATH (orders, POS, kitchen) ====================

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_reservation_id ON public.orders(reservation_id);
CREATE INDEX IF NOT EXISTS idx_orders_room_id ON public.orders(room_id);
CREATE INDEX IF NOT EXISTS idx_orders_qr_session_id ON public.orders(qr_session_id);

CREATE INDEX IF NOT EXISTS idx_orders_unified_restaurant_id ON public.orders_unified(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_unified_customer_id ON public.orders_unified(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_unified_table_id ON public.orders_unified(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_unified_reservation_id ON public.orders_unified(reservation_id);

CREATE INDEX IF NOT EXISTS idx_kitchen_orders_restaurant_id ON public.kitchen_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_order_id ON public.kitchen_orders(order_id);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_restaurant_id ON public.pos_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_order_id ON public.pos_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_kitchen_order_id ON public.pos_transactions(kitchen_order_id);

-- ==================== TIER 2: MENU & INVENTORY ====================

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_restaurant_id ON public.menu_item_variants(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_menu_item_id ON public.menu_item_variants(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_restaurant_id ON public.inventory_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_storage_location_id ON public.inventory_items(storage_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_restaurant_id ON public.inventory_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_item_id ON public.inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_lot_id ON public.inventory_transactions(lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_restaurant_id ON public.inventory_lots(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_inventory_item_id ON public.inventory_lots(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_supplier_id ON public.inventory_lots(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_purchase_order_id ON public.inventory_lots(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_restaurant_id ON public.inventory_alerts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_inventory_item_id ON public.inventory_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_restaurant_id ON public.storage_locations(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_recipes_restaurant_id ON public.recipes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_menu_item_id ON public.recipes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_inventory_item_id ON public.recipe_ingredients(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_variant_id ON public.recipe_ingredients(variant_id);
CREATE INDEX IF NOT EXISTS idx_batch_productions_restaurant_id ON public.batch_productions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_batch_productions_recipe_id ON public.batch_productions(recipe_id);

-- ==================== TIER 3: USERS, STAFF, AUTH ====================

CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON public.profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON public.staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_restaurant_id ON public.staff_roles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_restaurant_id ON public.staff_shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_id ON public.staff_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shift_assignments_restaurant_id ON public.staff_shift_assignments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_shift_assignments_staff_id ON public.staff_shift_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shift_assignments_shift_id ON public.staff_shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_clock_restaurant_id ON public.staff_time_clock(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_clock_staff_id ON public.staff_time_clock(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_clock_shift_id ON public.staff_time_clock(shift_id);
CREATE INDEX IF NOT EXISTS idx_staff_leaves_restaurant_id ON public.staff_leaves(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_leaves_staff_id ON public.staff_leaves(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_restaurant_id ON public.staff_leave_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_staff_id ON public.staff_leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_balances_restaurant_id ON public.staff_leave_balances(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_balances_staff_id ON public.staff_leave_balances(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_types_restaurant_id ON public.staff_leave_types(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_restaurant_id ON public.staff_documents(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_staff_id ON public.staff_documents(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_notifications_restaurant_id ON public.staff_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_notifications_staff_id ON public.staff_notifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant_id ON public.shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_restaurant_id ON public.user_roles(restaurant_id);

-- ==================== TIER 4: CUSTOMERS & CRM ====================

CREATE INDEX IF NOT EXISTS idx_customers_restaurant_id ON public.customers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_tier_id ON public.customers(loyalty_tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_restaurant_id ON public.customer_activities(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_customer_id ON public.customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_restaurant_id ON public.customer_notes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON public.customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_sessions_restaurant_id ON public.customer_order_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_sessions_qr_code_id ON public.customer_order_sessions(qr_code_id);

-- ==================== TIER 5: FINANCIAL ====================

CREATE INDEX IF NOT EXISTS idx_expenses_restaurant_id ON public.expenses(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_restaurant_id ON public.expense_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_restaurant_id ON public.financial_reports(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_id ON public.invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_restaurant_id ON public.payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_restaurant_id ON public.payment_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_restaurant_id ON public.payment_methods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_settings_restaurant_id ON public.payment_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_restaurant_id ON public.tax_configurations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_restaurant_id ON public.chart_of_accounts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_account_id ON public.chart_of_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_restaurant_id ON public.journal_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_restaurant_id ON public.budgets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_budget_id ON public.budget_line_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_account_id ON public.budget_line_items(account_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_restaurant_id ON public.monthly_budgets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_restaurant_id ON public.revenue_metrics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_reports_restaurant_id ON public.daily_summary_reports(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_operational_costs_restaurant_id ON public.operational_costs(restaurant_id);

-- ==================== TIER 6: RESERVATIONS, TABLES, ROOMS ====================

CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON public.reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON public.restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_restaurant_id ON public.table_reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_table_id ON public.table_reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_table_availability_slots_restaurant_id ON public.table_availability_slots(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_availability_slots_table_id ON public.table_availability_slots(table_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_restaurant_id ON public.waitlist(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_restaurant_id ON public.qr_codes(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_rooms_restaurant_id ON public.rooms(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_billings_restaurant_id ON public.room_billings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_billings_reservation_id ON public.room_billings(reservation_id);
CREATE INDEX IF NOT EXISTS idx_room_billings_room_id ON public.room_billings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_food_orders_restaurant_id ON public.room_food_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_food_orders_room_id ON public.room_food_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_room_food_orders_order_id ON public.room_food_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_room_cleaning_schedules_restaurant_id ON public.room_cleaning_schedules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_cleaning_schedules_room_id ON public.room_cleaning_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_room_cleaning_schedules_reservation_id ON public.room_cleaning_schedules(reservation_id);
CREATE INDEX IF NOT EXISTS idx_room_maintenance_requests_restaurant_id ON public.room_maintenance_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_maintenance_requests_room_id ON public.room_maintenance_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_room_moves_restaurant_id ON public.room_moves(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_moves_from_room_id ON public.room_moves(from_room_id);
CREATE INDEX IF NOT EXISTS idx_room_moves_to_room_id ON public.room_moves(to_room_id);
CREATE INDEX IF NOT EXISTS idx_room_moves_check_in_id ON public.room_moves(check_in_id);
CREATE INDEX IF NOT EXISTS idx_room_waitlist_restaurant_id ON public.room_waitlist(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_amenities_restaurant_id ON public.room_amenities(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_amenity_inventory_restaurant_id ON public.room_amenity_inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_amenity_inventory_room_id ON public.room_amenity_inventory(room_id);
CREATE INDEX IF NOT EXISTS idx_room_amenity_inventory_amenity_id ON public.room_amenity_inventory(amenity_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_restaurant_id ON public.check_ins(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_room_id ON public.check_ins(room_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_reservation_id ON public.check_ins(reservation_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_guest_profile_id ON public.check_ins(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_night_audit_logs_restaurant_id ON public.night_audit_logs(restaurant_id);

-- ==================== TIER 7: GUESTS & LOYALTY ====================

CREATE INDEX IF NOT EXISTS idx_guest_profiles_restaurant_id ON public.guest_profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_preferences_restaurant_id ON public.guest_preferences(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_loyalty_restaurant_id ON public.guest_loyalty(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_restaurant_id ON public.guest_feedback(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_room_id ON public.guest_feedback(room_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_reservation_id ON public.guest_feedback(reservation_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_restaurant_id ON public.loyalty_programs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_restaurant_id ON public.loyalty_tiers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_restaurant_id ON public.loyalty_rewards(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_tier_id ON public.loyalty_rewards(tier_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_enrollments_restaurant_id ON public.loyalty_enrollments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_enrollments_customer_id ON public.loyalty_enrollments(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_restaurant_id ON public.loyalty_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_restaurant_id ON public.loyalty_redemptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_customer_id ON public.loyalty_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_reward_id ON public.loyalty_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_order_id ON public.loyalty_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_restaurant_id ON public.lost_found_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_room_id ON public.lost_found_items(room_id);

-- ==================== TIER 8: SUPPLIERS & PURCHASING ====================

CREATE INDEX IF NOT EXISTS idx_suppliers_restaurant_id ON public.suppliers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_restaurant_id ON public.supplier_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier_id ON public.supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_order_id ON public.supplier_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_inventory_item_id ON public.supplier_order_items(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_supplier_price_history_restaurant_id ON public.supplier_price_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_price_history_supplier_id ON public.supplier_price_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_price_history_inventory_item_id ON public.supplier_price_history(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_supplier_price_history_purchase_order_id ON public.supplier_price_history(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_restaurant_id ON public.purchase_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_inventory_item_id ON public.purchase_order_items(inventory_item_id);

-- ==================== TIER 9: MARKETING & CHANNELS ====================

CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_restaurant_id ON public.promotion_campaigns(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sent_promotions_restaurant_id ON public.sent_promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sent_promotions_promotion_id ON public.sent_promotions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_sent_promotions_reservation_id ON public.sent_promotions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_restaurant_id ON public.whatsapp_templates(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_sends_restaurant_id ON public.whatsapp_campaign_sends(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_sends_campaign_id ON public.whatsapp_campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_sends_customer_id ON public.whatsapp_campaign_sends(customer_id);

CREATE INDEX IF NOT EXISTS idx_booking_channels_restaurant_id ON public.booking_channels(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_inventory_restaurant_id ON public.channel_inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_inventory_channel_id ON public.channel_inventory(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_inventory_room_id ON public.channel_inventory(room_id);
CREATE INDEX IF NOT EXISTS idx_channel_inventory_rate_plan_id ON public.channel_inventory(rate_plan_id);
CREATE INDEX IF NOT EXISTS idx_channel_rate_rules_restaurant_id ON public.channel_rate_rules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_rate_rules_channel_id ON public.channel_rate_rules(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_rate_rules_rate_plan_id ON public.channel_rate_rules(rate_plan_id);
CREATE INDEX IF NOT EXISTS idx_channel_restrictions_restaurant_id ON public.channel_restrictions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_restrictions_channel_id ON public.channel_restrictions(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_room_mapping_restaurant_id ON public.channel_room_mapping(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_channel_room_mapping_channel_id ON public.channel_room_mapping(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_room_mapping_hms_room_type_id ON public.channel_room_mapping(hms_room_type_id);

-- ==================== TIER 10: OTA, SYNC, MISC ====================

CREATE INDEX IF NOT EXISTS idx_ota_bookings_restaurant_id ON public.ota_bookings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ota_bookings_channel_id ON public.ota_bookings(channel_id);
CREATE INDEX IF NOT EXISTS idx_ota_bookings_pms_reservation_id ON public.ota_bookings(pms_reservation_id);
CREATE INDEX IF NOT EXISTS idx_ota_credentials_restaurant_id ON public.ota_credentials(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ota_credentials_channel_id ON public.ota_credentials(channel_id);

CREATE INDEX IF NOT EXISTS idx_sync_logs_restaurant_id ON public.sync_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_channel_id ON public.sync_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_restaurant_id ON public.sync_retry_queue(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_channel_id ON public.sync_retry_queue(channel_id);
CREATE INDEX IF NOT EXISTS idx_sync_retry_queue_sync_log_id ON public.sync_retry_queue(sync_log_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant_id ON public.audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_backup_settings_restaurant_id ON public.backup_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_backups_restaurant_id ON public.backups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_restaurant_id ON public.owner_notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_restaurant_id ON public.competitor_pricing(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_restaurant_id ON public.pricing_rules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_rate_plans_restaurant_id ON public.rate_plans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_rate_parity_checks_restaurant_id ON public.rate_parity_checks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pool_inventory_restaurant_id ON public.pool_inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_restaurant_id ON public.split_bills(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_check_in_id ON public.split_bills(check_in_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_portions_split_bill_id ON public.split_bill_portions(split_bill_id);

-- ==================== TIER 11: ORG-LEVEL ====================

CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id ON public.organizations(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_organization_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON public.restaurant_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_plan_id ON public.restaurant_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id ON public.restaurant_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_currency_id ON public.restaurant_settings(currency_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_operating_hours_restaurant_id ON public.restaurant_operating_hours(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_component_permissions_component_id ON public.component_permissions(component_id);
CREATE INDEX IF NOT EXISTS idx_component_table_mapping_component_id ON public.component_table_mapping(component_id);

COMMIT;
