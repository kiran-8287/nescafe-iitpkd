-- =============================================================
-- NESCAFE IITPKD — Phase 1 Migration
-- Run this ENTIRE file in Supabase SQL Editor in one shot.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE everywhere).
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Add updated_at to orders + auto-update trigger
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 2. Add image_url to order_items (needed for Quick Reorder)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS image_url TEXT;


-- ─────────────────────────────────────────────────────────────
-- 3. payment_alerts — captures orphaned payments for manual review
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_alerts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    amount              INTEGER,
    event               TEXT,
    resolved            BOOLEAN DEFAULT false,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment alerts"
    ON public.payment_alerts FOR SELECT USING (public.is_admin());

CREATE POLICY "Service role can insert payment alerts"
    ON public.payment_alerts FOR INSERT WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- 4. settings — key/value config (cafe_open, etc.)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings"
    ON public.settings FOR SELECT USING (true);

CREATE POLICY "Admins can update settings"
    ON public.settings FOR UPDATE USING (public.is_admin());

-- Seed default value
INSERT INTO public.settings (key, value)
VALUES ('cafe_open', 'true')
ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 5. Performance Indexes
-- ─────────────────────────────────────────────────────────────

-- Admin time-range queries (ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON public.orders(created_at DESC);

-- Admin status filter tab
CREATE INDEX IF NOT EXISTS idx_orders_status
    ON public.orders(status);

-- Most common admin query: status + time range together
CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON public.orders(status, created_at DESC);

-- OrderNotificationListener: user_id + status = 'ready'
CREATE INDEX IF NOT EXISTS idx_orders_user_status
    ON public.orders(user_id, status);

-- OTP rate limiting + verify
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone
    ON public.phone_otps(phone);

CREATE INDEX IF NOT EXISTS idx_phone_otps_expires
    ON public.phone_otps(expires_at);


-- ─────────────────────────────────────────────────────────────
-- 6. create_order_atomic — fully transactional order creation
--    Replaces the separate INSERT + loop in /verify-payment
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_user_id            UUID,
    p_total_amount       DECIMAL,
    p_order_mode         TEXT,
    p_hostel_block       TEXT,
    p_razorpay_order_id  TEXT,
    p_razorpay_payment_id TEXT,
    p_items              JSONB   -- [{id, name, quantity, price, variant, customization, image_url}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id   UUID;
    v_item       JSONB;
    v_stock_ok   BOOLEAN;
BEGIN
    -- ── Step 1: Insert the order row ──────────────────────────
    INSERT INTO public.orders (
        user_id,
        total_amount,
        order_mode,
        hostel_block,
        status,
        payment_status,
        razorpay_order_id,
        razorpay_payment_id
    ) VALUES (
        p_user_id,
        p_total_amount,
        p_order_mode,
        p_hostel_block,
        'preparing',
        'paid',
        p_razorpay_order_id,
        p_razorpay_payment_id
    )
    RETURNING id INTO v_order_id;

    -- ── Step 2: Atomic inventory decrement per item ───────────
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT public.process_item_order(
            (v_item->>'id')::UUID,
            (v_item->>'quantity')::INT
        ) INTO v_stock_ok;

        IF NOT v_stock_ok THEN
            -- Raising an exception automatically rolls back the
            -- entire transaction (order insert + previous decrements)
            RAISE EXCEPTION 'STOCK_FAILURE:%', (v_item->>'name');
        END IF;
    END LOOP;

    -- ── Step 3: Insert order_items (using backend-verified prices) ──
    INSERT INTO public.order_items (
        order_id,
        item_id,
        name,
        quantity,
        price,
        variant,
        customization,
        image_url
    )
    SELECT
        v_order_id,
        item->>'id',
        item->>'name',
        (item->>'quantity')::INT,
        (item->>'price')::DECIMAL,
        COALESCE(item->>'variant', 'Standard'),
        COALESCE(item->'customization', '[]'::JSONB),
        item->>'image_url'
    FROM jsonb_array_elements(p_items) AS item;

    RETURN jsonb_build_object('success', true, 'order_id', v_order_id);

EXCEPTION WHEN OTHERS THEN
    -- PostgreSQL automatically rolls back on unhandled exception.
    -- Return the error message so the backend can parse it.
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Allow authenticated users (the backend uses service role, but grant anyway)
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, DECIMAL, TEXT, TEXT, TEXT, TEXT, JSONB)
    TO authenticated, service_role;


-- ─────────────────────────────────────────────────────────────
-- 7. get_queue_position — live queue position + ETA for students
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_queue_position(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_created_at  TIMESTAMPTZ;
    v_position          INT;
    v_avg_prep_seconds  INT := 180;  -- 3 minutes per order; tune over time
BEGIN
    SELECT created_at INTO v_order_created_at
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('position', 0, 'estimated_wait_seconds', 0);
    END IF;

    -- Orders placed strictly BEFORE this one that are still 'preparing'
    SELECT COUNT(*) INTO v_position
    FROM public.orders
    WHERE status = 'preparing'
      AND created_at < v_order_created_at;

    RETURN jsonb_build_object(
        'position',                 v_position + 1,
        'estimated_wait_seconds',   v_position * v_avg_prep_seconds
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_queue_position(UUID) TO authenticated, service_role;


-- ─────────────────────────────────────────────────────────────
-- 8. cleanup_expired_otps — housekeeping utility
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.phone_otps
    WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;


-- ─────────────────────────────────────────────────────────────
-- Done. Verify by running:
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--   AND routine_name IN (
--     'create_order_atomic','get_queue_position',
--     'cleanup_expired_otps','set_updated_at'
--   );
-- ─────────────────────────────────────────────────────────────
