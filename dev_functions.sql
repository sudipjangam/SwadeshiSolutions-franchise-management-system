CREATE OR REPLACE FUNCTION public.add_customer_activity(customer_id_param uuid, restaurant_id_param uuid, activity_type_param text, description_param text)
 RETURNS SETOF customer_activities
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO public.customer_activities (
    customer_id,
    restaurant_id,
    activity_type,
    description
  )
  VALUES (
    customer_id_param,
    restaurant_id_param,
    activity_type_param,
    description_param
  )
  RETURNING *;
END;
$function$


CREATE OR REPLACE FUNCTION public.add_customer_note(customer_id_param uuid, restaurant_id_param uuid, content_param text, created_by_param text)
 RETURNS SETOF customer_notes
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO public.customer_notes (
    customer_id,
    restaurant_id,
    content,
    created_by
  )
  VALUES (
    customer_id_param,
    restaurant_id_param,
    content_param,
    created_by_param
  )
  RETURNING *;
END;
$function$


CREATE OR REPLACE FUNCTION public.add_loyalty_transaction(customer_id_param uuid, restaurant_id_param uuid, transaction_type_param text, points_param integer, source_param text, notes_param text, created_by_param uuid)
 RETURNS SETOF loyalty_transactions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO public.loyalty_transactions (
    customer_id,
    restaurant_id,
    transaction_type,
    points,
    source,
    notes,
    created_by
  )
  VALUES (
    customer_id_param,
    restaurant_id_param,
    transaction_type_param,
    points_param,
    source_param,
    notes_param,
    created_by_param
  )
  RETURNING *;
END;
$function$


CREATE OR REPLACE FUNCTION public.audit_log_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.audit_logs (
        restaurant_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    )
    VALUES (
        COALESCE(NEW.restaurant_id, OLD.restaurant_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$function$


CREATE OR REPLACE FUNCTION public.calculate_customer_tier(customer_points integer, restaurant_id_param uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tier_id UUID;
BEGIN
  SELECT id INTO tier_id
  FROM public.loyalty_tiers
  WHERE restaurant_id = restaurant_id_param
    AND points_required <= customer_points
  ORDER BY points_required DESC
  LIMIT 1;
  
  RETURN tier_id;
END;
$function$


CREATE OR REPLACE FUNCTION public.calculate_recipe_cost()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE recipes
  SET 
    total_cost = (
      SELECT COALESCE(SUM(total_cost), 0)
      FROM recipe_ingredients
      WHERE recipe_id = NEW.recipe_id
    ),
    food_cost_percentage = CASE
      WHEN selling_price > 0 THEN 
        ((SELECT COALESCE(SUM(total_cost), 0)
          FROM recipe_ingredients
          WHERE recipe_id = NEW.recipe_id) / selling_price) * 100
      ELSE 0
    END,
    margin_percentage = CASE
      WHEN selling_price > 0 THEN 
        100 - (((SELECT COALESCE(SUM(total_cost), 0)
          FROM recipe_ingredients
          WHERE recipe_id = NEW.recipe_id) / selling_price) * 100)
      ELSE 0
    END,
    updated_at = now()
  WHERE id = NEW.recipe_id;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.capture_supplier_price_on_po_receive()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only trigger when status changes to 'received'
  IF NEW.status = 'received' AND (OLD.status IS DISTINCT FROM 'received') THEN
    INSERT INTO public.supplier_price_history (restaurant_id, supplier_id, inventory_item_id, unit_price, quantity, purchase_order_id)
    SELECT
      NEW.restaurant_id,
      NEW.supplier_id,
      poi.inventory_item_id,
      poi.unit_cost,
      poi.quantity,
      NEW.id
    FROM public.purchase_order_items poi
    WHERE poi.purchase_order_id = NEW.id
      AND poi.inventory_item_id IS NOT NULL
      AND poi.unit_cost IS NOT NULL
      AND poi.unit_cost > 0;
  END IF;

  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.check_access(_table_name text, _restaurant_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.restaurant_id = _restaurant_id
      AND (
        -- Full access via role flag (admin/owner)
        EXISTS (
          SELECT 1 FROM public.roles r
          WHERE r.id = p.role_id AND r.has_full_access = true
        )
        OR
        -- Component-based access via role_components + component_table_mapping
        EXISTS (
          SELECT 1
          FROM public.role_components rc
          JOIN public.component_table_mapping ctm ON ctm.component_id = rc.component_id
          WHERE rc.role_id = p.role_id
            AND ctm.table_name = _table_name
        )
      )
  )
$function$


CREATE OR REPLACE FUNCTION public.fn_on_new_ota_booking()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only decrement if not already done (idempotency guard)
  IF NEW.inventory_decremented = false AND NEW.booking_status = 'confirmed' THEN
    -- Decrement pool inventory for each date in the booking range
    UPDATE pool_inventory 
    SET 
      available_count = GREATEST(available_count - NEW.room_count, 0),
      updated_at = now()
    WHERE restaurant_id = NEW.restaurant_id 
      AND room_type = NEW.room_type
      AND date >= NEW.check_in
      AND date < NEW.check_out;
    
    -- Mark as decremented
    NEW.inventory_decremented := true;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_on_ota_booking_cancel()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' AND OLD.inventory_decremented = true THEN
    UPDATE pool_inventory 
    SET 
      available_count = LEAST(available_count + OLD.room_count, total_count),
      updated_at = now()
    WHERE restaurant_id = OLD.restaurant_id 
      AND room_type = OLD.room_type
      AND date >= OLD.check_in
      AND date < OLD.check_out;
    
    NEW.inventory_decremented := false;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_update_cms_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.generate_purchase_order_number(restaurant_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  order_count INTEGER;
  order_number TEXT;
BEGIN
  SELECT COUNT(*) INTO order_count
  FROM purchase_orders
  WHERE restaurant_id = restaurant_id_param
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  order_number := 'PO-' || EXTRACT(YEAR FROM now()) || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
  
  RETURN order_number;
END;
$function$


CREATE OR REPLACE FUNCTION public.generate_restaurant_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
  final_slug := base_slug;
  
  -- Handle duplicates by appending number
  WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.generate_time_slots_for_date(p_restaurant_id uuid, p_date date, p_slot_duration_minutes integer DEFAULT 30)
 RETURNS TABLE(time_slot time without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  opening_time TIME;
  closing_time TIME;
  current_slot TIME;
  day_of_week INTEGER;
BEGIN
  day_of_week := EXTRACT(DOW FROM p_date);
  
  SELECT roh.opening_time, roh.closing_time
  INTO opening_time, closing_time
  FROM restaurant_operating_hours roh
  WHERE roh.restaurant_id = p_restaurant_id
  AND roh.day_of_week = day_of_week
  AND roh.is_closed = false;
  
  IF opening_time IS NULL THEN
    RETURN;
  END IF;
  
  current_slot := opening_time;
  WHILE current_slot < closing_time LOOP
    time_slot := current_slot;
    RETURN NEXT;
    current_slot := current_slot + (p_slot_duration_minutes || ' minutes')::INTERVAL;
  END LOOP;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_analytics_data(p_restaurant_id uuid, p_start_date text, p_end_date text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  total_revenue numeric := 0;
  total_orders integer := 0;
  avg_order_value numeric := 0;
  new_customers integer := 0;
  daily_revenue jsonb;
  sales_by_category jsonb;
  top_products jsonb;
  start_timestamp timestamptz;
  end_timestamp timestamptz;
BEGIN
  -- Convert text dates to timestamptz with full-day coverage
  start_timestamp := (p_start_date || ' 00:00:00')::timestamptz;
  end_timestamp := (p_end_date || ' 23:59:59')::timestamptz;

  -- Calculate revenue from COMPLETED / non-cancelled, non-refunded orders
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(*),
    COALESCE(AVG(total), 0)
  INTO total_revenue, total_orders, avg_order_value
  FROM orders
  WHERE restaurant_id = p_restaurant_id
    AND status NOT IN ('cancelled', 'refunded')
    AND created_at BETWEEN start_timestamp AND end_timestamp;

  -- Add hotel revenue from PAID room billings (using created_at)
  SELECT total_revenue + COALESCE(SUM(total_amount), 0)
  INTO total_revenue
  FROM room_billings
  WHERE restaurant_id = p_restaurant_id
    AND payment_status = 'paid'
    AND created_at BETWEEN start_timestamp AND end_timestamp;

  -- Count new customers in date range
  SELECT COUNT(DISTINCT id)
  INTO new_customers
  FROM customers
  WHERE restaurant_id = p_restaurant_id
    AND created_at BETWEEN start_timestamp AND end_timestamp;

  -- Daily revenue trend (restaurant + hotel combined)
  WITH restaurant_daily AS (
    SELECT 
      created_at::date as date,
      SUM(total) as revenue
    FROM orders
    WHERE restaurant_id = p_restaurant_id
      AND status NOT IN ('cancelled', 'refunded')
      AND created_at BETWEEN start_timestamp AND end_timestamp
    GROUP BY created_at::date
  ),
  hotel_daily AS (
    SELECT 
      created_at::date as date,
      SUM(total_amount) as revenue
    FROM room_billings
    WHERE restaurant_id = p_restaurant_id
      AND payment_status = 'paid'
      AND created_at BETWEEN start_timestamp AND end_timestamp
    GROUP BY created_at::date
  ),
  combined_daily AS (
    SELECT date, SUM(revenue) as revenue
    FROM (
      SELECT * FROM restaurant_daily
      UNION ALL
      SELECT * FROM hotel_daily
    ) all_revenue
    GROUP BY date
    ORDER BY date
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date::text,
      'revenue', revenue
    )
  )
  INTO daily_revenue
  FROM combined_daily;

  -- Sales by category from order items JSON
  WITH category_sales AS (
    SELECT 
      COALESCE(
        (SELECT category FROM menu_items WHERE name = item->>'name' LIMIT 1),
        'Other'
      ) as category,
      SUM((item->>'price')::numeric * COALESCE((item->>'quantity')::numeric, 1)) as value
    FROM orders,
    LATERAL jsonb_array_elements(
      CASE 
        WHEN jsonb_typeof(items) = 'array' THEN items
        ELSE '[]'::jsonb
      END
    ) as item
    WHERE restaurant_id = p_restaurant_id
      AND status NOT IN ('cancelled', 'refunded')
      AND created_at BETWEEN start_timestamp AND end_timestamp
    GROUP BY category
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', category,
      'value', value
    ) ORDER BY value DESC
  )
  INTO sales_by_category
  FROM category_sales;

  -- Top performing products
  WITH product_sales AS (
    SELECT 
      item->>'name' as product_name,
      SUM((item->>'price')::numeric * COALESCE((item->>'quantity')::numeric, 1)) as total_revenue,
      SUM(COALESCE((item->>'quantity')::numeric, 1)) as total_quantity
    FROM orders,
    LATERAL jsonb_array_elements(
      CASE 
        WHEN jsonb_typeof(items) = 'array' THEN items
        ELSE '[]'::jsonb
      END
    ) as item
    WHERE restaurant_id = p_restaurant_id
      AND status NOT IN ('cancelled', 'refunded')
      AND created_at BETWEEN start_timestamp AND end_timestamp
      AND item->>'name' IS NOT NULL
    GROUP BY item->>'name'
    ORDER BY total_revenue DESC
    LIMIT 10
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', product_name,
      'revenue', total_revenue,
      'quantity', total_quantity
    )
  )
  INTO top_products
  FROM product_sales;

  -- Build final result
  result := jsonb_build_object(
    'kpis', jsonb_build_object(
      'totalRevenue', total_revenue,
      'totalOrders', total_orders,
      'avgOrderValue', avg_order_value,
      'newCustomers', new_customers
    ),
    'charts', jsonb_build_object(
      'dailyRevenue', COALESCE(daily_revenue, '[]'::jsonb),
      'salesByCategory', COALESCE(sales_by_category, '[]'::jsonb),
      'topProducts', COALESCE(top_products, '[]'::jsonb)
    )
  );

  RETURN result;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_customer_activities(customer_id_param uuid)
 RETURNS SETOF customer_activities
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.customer_activities
  WHERE customer_id = customer_id_param
  ORDER BY created_at DESC;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_customer_notes(customer_id_param uuid)
 RETURNS SETOF customer_notes
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.customer_notes
  WHERE customer_id = customer_id_param
  ORDER BY created_at DESC;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_loyalty_transactions(customer_id_param uuid)
 RETURNS SETOF loyalty_transactions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.loyalty_transactions
  WHERE customer_id = customer_id_param
  ORDER BY created_at DESC;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_user_components(user_id uuid)
 RETURNS TABLE(component_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role_id uuid;
  v_has_full_access boolean;
BEGIN
  -- Get user's role info including has_full_access flag
  SELECT p.role_id, COALESCE(r.has_full_access, false)
  INTO v_role_id, v_has_full_access
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = user_id;
  
  -- Full access (Admin) = all components
  IF v_has_full_access THEN
    RETURN QUERY SELECT ac.name FROM app_components ac ORDER BY ac.name;
    RETURN;
  END IF;
  
  -- Normal access = check role_components
  IF v_role_id IS NOT NULL THEN
    RETURN QUERY
    SELECT DISTINCT ac.name
    FROM app_components ac
    INNER JOIN role_components rc ON ac.id = rc.component_id
    WHERE rc.role_id = v_role_id
    ORDER BY ac.name;
  END IF;
  
  -- No role assigned - return empty
  RETURN;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
 RETURNS TABLE(permission text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin/Owner has full access - return all unique permissions
  IF public.user_is_admin_or_owner(p_user_id) THEN
    RETURN QUERY 
    SELECT DISTINCT cp.permission 
    FROM component_permissions cp;
    RETURN;
  END IF;

  -- Get permissions via user's role → role_components → component_permissions
  -- First try with role_id (custom roles)
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND role_id IS NOT NULL) THEN
    RETURN QUERY
    SELECT DISTINCT cp.permission
    FROM profiles p
    JOIN role_components rc ON rc.role_id = p.role_id
    JOIN component_permissions cp ON cp.component_id = rc.component_id
    WHERE p.id = p_user_id;
  ELSE
    -- Fallback to system role (profiles.role column)
    RETURN QUERY
    SELECT DISTINCT cp.permission
    FROM profiles p
    JOIN roles r ON LOWER(r.name) = LOWER(p.role::TEXT)
    JOIN role_components rc ON rc.role_id = r.id
    JOIN component_permissions cp ON cp.component_id = rc.component_id
    WHERE p.id = p_user_id;
  END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT restaurant_id FROM public.profiles WHERE id = _user_id;
$function$


CREATE OR REPLACE FUNCTION public.get_user_role_name(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  custom_role_name TEXT;
  system_role TEXT;
BEGIN
  SELECT r.name INTO custom_role_name
  FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = user_id;

  IF custom_role_name IS NOT NULL THEN
    RETURN custom_role_name;
  END IF;

  SELECT role INTO system_role
  FROM profiles
  WHERE id = user_id;

  RETURN system_role;
END;
$function$


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (new.id, 'manager');
    RETURN new;
END;
$function$


CREATE OR REPLACE FUNCTION public.has_active_subscription(restaurant_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM restaurant_subscriptions
        WHERE restaurant_subscriptions.restaurant_id = $1
        AND status = 'active'
        AND current_period_end > now()
    );
END;
$function$


CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = _user_id
      AND r.name = ANY(_roles)
  )
$function$


CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles user_role[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$function$


CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$


CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  );
$function$


CREATE OR REPLACE FUNCTION public.moddatetime()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION public.reset_notification_sent()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (NEW.quantity > COALESCE(NEW.reorder_level, 0) AND NEW.notification_sent = true) THEN
        NEW.notification_sent := false;
    END IF;
    
    IF (OLD.quantity > COALESCE(NEW.reorder_level, 0) AND NEW.quantity <= COALESCE(NEW.reorder_level, 0)) THEN
        INSERT INTO inventory_alerts (
            restaurant_id,
            inventory_item_id,
            alert_type,
            message
        ) VALUES (
            NEW.restaurant_id,
            NEW.id,
            'low_stock',
            'Item "' || NEW.name || '" is running low. Current quantity: ' || NEW.quantity || ' ' || NEW.unit || ', Reorder level: ' || COALESCE(NEW.reorder_level, 0) || ' ' || NEW.unit
        );
    END IF;
    
    RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$


CREATE OR REPLACE FUNCTION public.seed_default_roles_for_restaurant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role record;
BEGIN
  -- Only seed if restaurant_id is not null and not already seeded
  IF NEW.restaurant_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE restaurant_id = NEW.restaurant_id AND is_system = true LIMIT 1) THEN
      
      -- 1. Insert Base Roles
      INSERT INTO public.roles (name, description, restaurant_id, is_deletable, is_system, has_full_access)
      VALUES 
        ('Owner', 'Restaurant owner with full control', NEW.restaurant_id, false, true, true),
        ('Admin', 'Full system access (superuser)', NEW.restaurant_id, false, true, true),
        ('Manager', 'All operations except financial reports', NEW.restaurant_id, false, true, false),
        ('Chef', 'Kitchen, orders, inventory, and menu management', NEW.restaurant_id, false, true, false),
        ('Waiter', 'Orders, POS, tables, reservations', NEW.restaurant_id, false, true, false),
        ('Staff', 'Basic operational access', NEW.restaurant_id, false, true, false),
        ('Viewer', 'Dashboard view only (restricted)', NEW.restaurant_id, false, true, false)
      ON CONFLICT (name, restaurant_id) DO NOTHING;

      -- 2. Auto-Assign Granular Application Components
      FOR v_role IN SELECT id, name FROM public.roles WHERE restaurant_id = NEW.restaurant_id AND is_system = true LOOP
        
        IF v_role.name IN ('Manager', 'Admin', 'Owner', 'admin') THEN
            -- Managers get all components (they are restricted by Subscription Plan Gate 1)
            INSERT INTO public.role_components (role_id, component_id)
            SELECT v_role.id, id FROM public.app_components ON CONFLICT DO NOTHING;
            
        ELSIF v_role.name = 'Chef' THEN
            -- Chefs get kitchen, recipe, inventory, and menu modules
            INSERT INTO public.role_components (role_id, component_id)
            SELECT v_role.id, id FROM public.app_components 
            WHERE name ILIKE 'kitchen%' OR name ILIKE 'recipe%' OR name ILIKE 'inventory%' OR name ILIKE 'menu%' OR name ILIKE 'qsr%'
            ON CONFLICT DO NOTHING;
            
        ELSIF v_role.name = 'Waiter' THEN
            -- Waiters get POS, tables, reservations, and orders
            INSERT INTO public.role_components (role_id, component_id)
            SELECT v_role.id, id FROM public.app_components 
            WHERE name ILIKE 'pos%' OR name ILIKE 'order%' OR name ILIKE 'table%' OR name ILIKE 'reservation%' OR name ILIKE 'qsr%'
            ON CONFLICT DO NOTHING;
            
        END IF;
      END LOOP;

    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.seed_system_roles(p_restaurant_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  role_def RECORD;
BEGIN
  -- System role definitions
  FOR role_def IN
    SELECT * FROM (VALUES
      ('Owner',   'Restaurant owner with full control',                    true,  true),
      ('Admin',   'Full system access (superuser)',                        true,  true),
      ('Manager', 'All operations except financial reports',               true,  false),
      ('Chef',    'Kitchen, orders, inventory, and menu management',       true,  false),
      ('Waiter',  'Orders, POS, tables, reservations',                     true,  false),
      ('Staff',   'Basic operational access',                              true,  false),
      ('Viewer',  'Dashboard view only (restricted)',                      true,  false)
    ) AS t(name, description, is_system, has_full_access)
  LOOP
    -- Insert only if this role doesn't already exist for this restaurant
    INSERT INTO roles (name, description, is_system, has_full_access, is_deletable, restaurant_id)
    SELECT role_def.name, role_def.description, role_def.is_system, role_def.has_full_access, 
           NOT role_def.is_system, p_restaurant_id
    WHERE NOT EXISTS (
      SELECT 1 FROM roles 
      WHERE restaurant_id = p_restaurant_id 
        AND lower(name) = lower(role_def.name)
        AND is_system = true
    );
  END LOOP;
END;
$function$


CREATE OR REPLACE FUNCTION public.suggest_purchase_orders(restaurant_id_param uuid)
 RETURNS TABLE(supplier_id uuid, supplier_name text, items_count integer, estimated_total numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH low_stock_items AS (
    SELECT 
      ii.*,
      s.id as supplier_id,
      s.name as supplier_name,
      (ii.reorder_level * 2 - ii.quantity) as suggested_quantity,
      COALESCE(ii.cost_per_unit, 0) as unit_cost
    FROM inventory_items ii
    CROSS JOIN suppliers s
    WHERE ii.restaurant_id = restaurant_id_param
      AND s.restaurant_id = restaurant_id_param
      AND s.is_active = true
      AND ii.reorder_level IS NOT NULL
      AND ii.quantity <= ii.reorder_level
  )
  SELECT 
    lsi.supplier_id,
    lsi.supplier_name,
    COUNT(*)::INTEGER as items_count,
    SUM(lsi.suggested_quantity * lsi.unit_cost) as estimated_total
  FROM low_stock_items lsi
  GROUP BY lsi.supplier_id, lsi.supplier_name
  ORDER BY estimated_total DESC;
END;
$function$


CREATE OR REPLACE FUNCTION public.sync_auth_user_email_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Only proceed when email is not null
    IF NEW.email IS NOT NULL THEN
      UPDATE public.profiles
      SET email = NEW.email
      WHERE id = NEW.id;
      -- If no profile exists, do nothing. To create profiles automatically, change to INSERT ... ON CONFLICT
    END IF;
  END IF;
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.sync_kitchen_to_orders()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only sync if order_id is linked
  IF NEW.order_id IS NOT NULL THEN
    -- Sync status changes
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE public.orders 
      SET 
        status = 'completed',
        updated_at = NOW()
      WHERE id = NEW.order_id;
    ELSIF NEW.status = 'preparing' AND OLD.status = 'new' THEN
      UPDATE public.orders 
      SET 
        status = 'preparing',
        updated_at = NOW()
      WHERE id = NEW.order_id;
    ELSIF NEW.status = 'ready' AND OLD.status != 'ready' THEN
      UPDATE public.orders 
      SET 
        status = 'ready',
        updated_at = NOW()
      WHERE id = NEW.order_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.sync_orders_status_from_kitchen()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  item jsonb;
  gross_total numeric := 0;
  items_text text[] := ARRAY[]::text[];
  item_price numeric;
  item_qty numeric;
  item_name text;
  item_notes jsonb;
  notes_str text;
BEGIN
  -- Link check
  IF NEW.order_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Sync Status
  IF NEW.status = 'preparing' THEN
    UPDATE public.orders SET status = 'preparing', updated_at = now() WHERE id = NEW.order_id;
  ELSIF NEW.status = 'ready' OR NEW.status = 'completed' THEN
    UPDATE public.orders SET status = 'completed', updated_at = now() WHERE id = NEW.order_id;
  ELSIF NEW.status = 'new' THEN
    UPDATE public.orders SET status = 'pending', updated_at = now() WHERE id = NEW.order_id;
  END IF;

  -- 2. Sync Items and Revenue
  -- Only proceed if items are present
  IF NEW.items IS NOT NULL AND jsonb_typeof(NEW.items) = 'array' THEN
    
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      item_price := COALESCE((item->>'price')::numeric, 0);
      item_qty := COALESCE((item->>'quantity')::numeric, 1);
      item_name := item->>'name';
      item_notes := item->'notes';
      
      gross_total := gross_total + (item_price * item_qty);

      -- Format Notes
      notes_str := '';
      IF item_notes IS NOT NULL AND jsonb_typeof(item_notes) = 'array' AND jsonb_array_length(item_notes) > 0 THEN
         SELECT string_agg(value::text, ', ') INTO notes_str FROM jsonb_array_elements_text(item_notes);
         notes_str := ' (' || notes_str || ')';
      ELSIF item->>'notes' IS NOT NULL AND (item->>'notes') != '' THEN
         notes_str := ' (' || (item->>'notes') || ')';
      END IF;

      items_text := array_append(items_text, (item_qty::text || 'x ' || item_name || notes_str || ' @' || item_price::text));
    END LOOP;

    -- Update Order with formatted items and calculated Net Total (preserving discount)
    UPDATE public.orders 
    SET 
      items = items_text,
      total = GREATEST(0, gross_total - COALESCE(discount_amount, 0)),
      updated_at = now()
    WHERE id = NEW.order_id;
    
  END IF;

  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.sync_orders_to_kitchen()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Sync status changes to kitchen_orders
  IF NEW.status != OLD.status THEN
    UPDATE public.kitchen_orders 
    SET 
      status = NEW.status,
      updated_at = NOW(),
      completed_at = CASE WHEN NEW.status = 'completed' THEN NOW() ELSE completed_at END
    WHERE order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_customer_loyalty_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.loyalty_points IS DISTINCT FROM NEW.loyalty_points THEN
    NEW.loyalty_tier_id = public.calculate_customer_tier(NEW.loyalty_points, NEW.restaurant_id);
    NEW.loyalty_points_last_updated = now();
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_daily_revenue_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO daily_revenue_stats (
    restaurant_id,
    date,
    total_revenue,
    order_count,
    average_order_value
  )
  SELECT
    restaurant_id,
    DATE(created_at) as date,
    COALESCE(SUM(total), 0) as total_revenue,
    COUNT(*) as order_count,
    COALESCE(AVG(total), 0) as average_order_value
  FROM orders
  WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    AND DATE(created_at) = DATE(COALESCE(NEW.created_at, OLD.created_at))
    AND status = 'completed'
    AND (order_type IS NULL OR order_type != 'non-chargeable')
  GROUP BY restaurant_id, DATE(created_at)
  ON CONFLICT (restaurant_id, date)
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    order_count = EXCLUDED.order_count,
    average_order_value = EXCLUDED.average_order_value,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$function$


CREATE OR REPLACE FUNCTION public.update_inventory_from_purchase_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  received_qty NUMERIC;
  v_restaurant_id UUID;
  v_supplier_id UUID;
  v_order_number TEXT;
  v_created_by UUID;
  v_lot_id UUID;
BEGIN
  IF OLD.received_quantity IS DISTINCT FROM NEW.received_quantity THEN
    received_qty := NEW.received_quantity - OLD.received_quantity;
    
    -- Get purchase order details
    SELECT po.restaurant_id, po.supplier_id, po.order_number, po.created_by
    INTO v_restaurant_id, v_supplier_id, v_order_number, v_created_by
    FROM purchase_orders po
    WHERE po.id = NEW.purchase_order_id;
    
    -- Update inventory quantity
    UPDATE inventory_items 
    SET quantity = quantity + received_qty,
        cost_per_unit = NEW.unit_cost,  -- update to latest purchase price
        updated_at = now()
    WHERE id = NEW.inventory_item_id;
    
    -- Create inventory lot for FIFO tracking
    IF received_qty > 0 THEN
      INSERT INTO inventory_lots (
        restaurant_id,
        inventory_item_id,
        purchase_date,
        quantity_purchased,
        quantity_remaining,
        unit_cost,
        supplier_id,
        purchase_order_id,
        lot_number,
        expiry_date,
        notes
      ) VALUES (
        v_restaurant_id,
        NEW.inventory_item_id,
        now(),
        received_qty,
        received_qty,
        NEW.unit_cost,
        v_supplier_id,
        NEW.purchase_order_id,
        'PO-' || v_order_number || '-' || SUBSTRING(gen_random_uuid()::text, 1, 4),
        NEW.expiry_date,
        'Received from purchase order: ' || v_order_number
      )
      RETURNING id INTO v_lot_id;
    END IF;
    
    -- Create transaction record with cost tracking
    INSERT INTO inventory_transactions (
      restaurant_id,
      inventory_item_id,
      transaction_type,
      quantity_change,
      unit_cost_at_time,
      total_cost,
      lot_id,
      reference_type,
      reference_id,
      notes,
      created_by
    ) VALUES (
      v_restaurant_id,
      NEW.inventory_item_id,
      'purchase',
      received_qty,
      NEW.unit_cost,
      received_qty * NEW.unit_cost,
      v_lot_id,
      'purchase_order_id',
      NEW.purchase_order_id,
      'Received from purchase order: ' || v_order_number,
      v_created_by
    );
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_is_b2b()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.customer_gstin IS NOT NULL AND NEW.customer_gstin != '' THEN
    NEW.is_b2b := true;
  ELSE
    NEW.is_b2b := false;
  END IF;
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_loyalty_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_payment_transaction_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.completed_at = CASE WHEN NEW.status IN ('success', 'failed') THEN now() ELSE NEW.completed_at END;
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_pos_transactions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_restaurants_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_roles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_room_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE rooms 
    SET status = 'occupied'
    WHERE id = NEW.room_id
    AND status = 'available';
    RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_table_status_from_reservations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IN ('confirmed', 'seated') THEN
    UPDATE restaurant_tables 
    SET status = 'occupied'
    WHERE id = NEW.table_id;
  ELSIF NEW.status IN ('completed', 'cancelled', 'no_show') THEN
    IF NOT EXISTS (
      SELECT 1 FROM table_reservations 
      WHERE table_id = NEW.table_id 
      AND reservation_date = CURRENT_DATE 
      AND status IN ('confirmed', 'seated')
      AND id != NEW.id
    ) THEN
      UPDATE restaurant_tables 
      SET status = 'available'
      WHERE id = NEW.table_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.user_has_role_or_permission(required_roles text[], required_permissions text[] DEFAULT NULL::text[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  user_restaurant_id uuid;
  has_permission boolean := false;
BEGIN
  SELECT role, restaurant_id INTO user_role, user_restaurant_id
  FROM profiles 
  WHERE id = auth.uid();
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  IF required_roles IS NOT NULL AND user_role = ANY(required_roles) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$


CREATE OR REPLACE FUNCTION public.user_has_table_access(_user_id uuid, _table_name text, _restaurant_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = _user_id
      AND (_restaurant_id IS NULL OR p.restaurant_id = _restaurant_id)
      AND (
        -- Full access via role flag
        EXISTS (
          SELECT 1 FROM public.roles r
          WHERE r.id = p.role_id AND r.has_full_access = true
        )
        OR
        -- Component-based access via role assignment
        EXISTS (
          SELECT 1
          FROM public.role_components rc
          JOIN public.component_table_mapping ctm ON ctm.component_id = rc.component_id
          WHERE rc.role_id = p.role_id
            AND ctm.table_name = _table_name
        )
      )
  )
$function$


CREATE OR REPLACE FUNCTION public.user_is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    LEFT JOIN roles r ON p.role_id = r.id
    WHERE p.id = user_id 
    AND (r.has_full_access = true OR p.role = 'admin')
  );
END;
$function$


CREATE OR REPLACE FUNCTION public.user_is_admin_or_owner(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = $1
      AND r.has_full_access = true
  )
$function$
