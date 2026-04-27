-- COMPREHENSIVE SCHEMA FOR NESCAFE ORDERING SYSTEM

-- 1. Create Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'student', -- student, faculty, staff, admin
    hostel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, phone_verified, role, hostel)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'phone_verified')::boolean, false),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'hostel'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.1 Create Phone OTPs Table
CREATE TABLE public.phone_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Items Table (Menu)
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    is_veg BOOLEAN DEFAULT true,
    badge TEXT,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0, -- Track inventory
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RPC for atomic inventory decrement
CREATE OR REPLACE FUNCTION public.process_item_order(item_uuid UUID, quantity_to_buy INT)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INT;
BEGIN
    -- Atomic update with condition to prevent negative stock
    UPDATE public.items
    SET stock_quantity = stock_quantity - quantity_to_buy
    WHERE id = item_uuid AND stock_quantity >= quantity_to_buy
    RETURNING stock_quantity INTO current_stock;

    IF FOUND THEN
        -- Bonus: If stock hits 0, flip is_available so frontend hides it immediately via Realtime
        IF current_stock = 0 THEN
            UPDATE public.items SET is_available = false WHERE id = item_uuid;
        END IF;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'preparing', -- preparing, ready, delivered, cancelled
    order_mode TEXT NOT NULL, -- pickup, delivery
    hostel_block TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Order Items Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id TEXT, -- Changed from UUID to TEXT to support mock integer IDs
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    variant TEXT,
    customization JSONB DEFAULT '[]'::jsonb
);

-- 5. Create Admin Management
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin check helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Row Level Security (RLS) Configuration

-- Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (public.is_admin());

-- Items table (Menu is public)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public items are viewable by everyone" ON public.items FOR SELECT USING (true);
CREATE POLICY "Admins can manage items" ON public.items FOR ALL USING (public.is_admin());

-- Orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can see all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update order status" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can see all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- Admins table RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view the admin list" ON public.admins FOR SELECT USING (public.is_admin());

-- 7. Indices for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_items_category ON public.items(category);

-- 8. Community Gallery Table
CREATE TABLE public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved gallery images" 
ON public.gallery_images FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can upload their own gallery images" 
ON public.gallery_images FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gallery images" 
ON public.gallery_images FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all gallery images" 
ON public.gallery_images FOR ALL 
USING (public.is_admin());

CREATE INDEX idx_gallery_status ON public.gallery_images(status);
CREATE INDEX idx_gallery_user_id ON public.gallery_images(user_id);
