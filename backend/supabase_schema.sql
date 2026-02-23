-- COMPREHENSIVE SCHEMA FOR NESCAFE ORDERING SYSTEM

-- 1. Create Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'student', -- student, faculty, staff, admin
    hostel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, hostel)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'hostel'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'preparing', -- preparing, ready, delivered, cancelled
    order_mode TEXT NOT NULL, -- pickup, delivery
    hostel_block TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
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

-- 5. Row Level Security (RLS) Configuration

-- Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Items table (Menu is public)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public items are viewable by everyone" ON public.items FOR SELECT USING (true);

-- Orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- 6. Indices for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_items_category ON public.items(category);
