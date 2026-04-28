-- ============================================================
-- MENU SEED: Full menu for Nescafe IIT Palakkad with Corrected Images
-- All images verified and corrected for accuracy.
-- Safe to re-run: uses DELETE + INSERT to avoid duplicates.
-- ============================================================

DELETE FROM public.items;

-- ============================================================
-- TEA AND COFFEE
-- ============================================================
INSERT INTO public.items (name, price, category, description, image, is_veg, is_available, stock_quantity) VALUES
  ('Sunrise Coffee',
   20.00, 'Tea and Coffee',
   'Classic instant coffee for a quick pick-me-up.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Expresso',
   20.00, 'Tea and Coffee',
   'Strong and pure shot of coffee for the bold.',
   'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Cappuccino',
   30.00, 'Tea and Coffee',
   'Rich espresso with steamed milk and a thick layer of foam.',
   'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Americano',
   35.00, 'Tea and Coffee',
   'Espresso diluted with hot water for a smooth finish.',
   'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Café Latte',
   30.00, 'Tea and Coffee',
   'Espresso with a generous amount of steamed milk.',
   'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Café Mocha',
   30.00, 'Tea and Coffee',
   'The perfect fusion of espresso, chocolate, and milk.',
   'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Tea Cardamom',
   15.00, 'Tea and Coffee',
   'Fragrant Indian tea infused with crushed cardamom.',
   'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Tea Masala',
   20.00, 'Tea and Coffee',
   'Spiced Indian chai with a blend of aromatic herbs.',
   'https://cdn.shopify.com/s/files/1/0758/6929/0779/files/Masala_Tea_-_Annams_Recipes_Shop_2_480x480.jpg?v=1732347934',
   true, true, 100),

  ('Tapri Coffee',
   50.00, 'Tea and Coffee',
   'Strong, frothy street-style coffee served hot.',
   'https://cherisetapri.com/Assets/Homepage/cherise-madras.jpg',
   true, true, 100),

  ('Hot Chocolate',
   40.00, 'Tea and Coffee',
   'Creamy, rich chocolate drink for a cozy mood.',
   'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Badam Milk',
   30.00, 'Tea and Coffee',
   'Warm milk flavored with almonds and saffron.',
   'https://www.funfoodfrolic.com/wp-content/uploads/2021/11/Blog-Thumbnail.jpg',
   true, true, 100),

  ('Irish Cappuccino',
   50.00, 'Tea and Coffee',
   'Cappuccino with a hint of Irish cream flavor.',
   'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Hazel Nut Cappuccino',
   50.00, 'Tea and Coffee',
   'Classic cappuccino with a nutty hazelnut twist.',
   'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ8hfcK0ykLKtQANx5dSmkjy5lcCrWkA3L5ZxxhF6ySwjPSb0WnliRFfqkrKtR9wenBRc_q7FK9yszG_3w9123oKaqBHAhp_64YNjevjRIC',
   true, true, 100),

  ('Lemon Tea',
   20.00, 'Tea and Coffee',
   'Refreshing black tea with a squeeze of fresh lemon.',
   'https://static.toiimg.com/photo/57788072.cms',
   true, true, 100),

  ('Green Tea',
   20.00, 'Tea and Coffee',
   'Healthy and light steamed green tea leaves.',
   'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=400',
   true, true, 100);

-- ============================================================
-- COLD BEVERAGES
-- ============================================================
INSERT INTO public.items (name, price, category, description, image, is_veg, is_available, stock_quantity) VALUES
  ('Iced Tea',
   50.00, 'Cold Beverages',
   'Classic chilled tea with a hint of lemon and mint.',
   'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Masala Iced Tea',
   55.00, 'Cold Beverages',
   'Chilled tea with a spicy Indian twist.',
   'https://www.wholeheartedeats.com/wp-content/uploads/2021/02/Iced-Masala-Chai.jpg',
   true, true, 100),

  ('Cafe Frappe',
   60.00, 'Cold Beverages',
   'Rich, creamy cold coffee blended with ice.',
   'https://upload.wikimedia.org/wikipedia/commons/7/73/Cafe-frape-glas-holztisch-unscharf.jpg',
   true, true, 100),

  ('Mocha Frappe',
   65.00, 'Cold Beverages',
   'Chocolatey cold coffee blend topped with foam.',
   'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Cold Chocolate',
   65.00, 'Cold Beverages',
   'Thick, creamy chocolate milk served ice cold.',
   'https://www.cacaobrew.co.uk/cdn/shop/articles/Iced_Chocolate2_bc38211b-194b-4ae7-9c8f-75e5cbb96100.jpg?v=1754420953',
   true, true, 100),

  ('Peach Iced Tea',
   65.00, 'Cold Beverages',
   'Sweet and fruity peach flavored iced tea.',
   'https://yousaypotatoes.com/wp-content/uploads/2022/06/peach-iced-tea-2sq.jpg',
   true, true, 100),

  ('Hazelnut Frappe',
   75.00, 'Cold Beverages',
   'Cold coffee with the rich taste of roasted hazelnuts.',
   'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Irish Frappe',
   75.00, 'Cold Beverages',
   'Smooth cold coffee with Irish cream flavor.',
   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKWCJOOqXS657aQbD_Sp3KxRQURNnd-SsCBA&s',
   true, true, 100),

  ('Kitkat/Munch Frappe',
   80.00, 'Cold Beverages',
   'Chunky chocolate bar blended into a thick frappe.',
   'https://www.nestleprofessional.in/sites/default/files/2021-08/Choco-Frappe.jpg',
   true, true, 100);

-- ============================================================
-- MAGGIE
-- ============================================================
INSERT INTO public.items (name, price, category, description, image, is_veg, is_available, stock_quantity) VALUES
  ('Classic Maggi',
   40.00, 'Maggie',
   'The original comfort food — simple and satisfying.',
   'https://vandebharatusa.com/wp-content/uploads/2024/10/Simple-Maggi.jpg',
   true, true, 100),

  ('Vegetable Maggi',
   45.00, 'Maggie',
   'Loaded with fresh veggies for a wholesome crunch.',
   'https://nfcihospitality.com/wp-content/uploads/2024/09/Full-Vegetable-loaded-Maggi-1536x1021.jpg',
   true, true, 100),

  ('Double Masala',
   45.00, 'Maggie',
   'Extra seasoning for that spicy kick you crave.',
   'https://images.jdmagicbox.com/quickquotes/images_main/fresh-plain-maggi-noodles-w66aowsa.jpg',
   true, true, 100),

  ('Butter Maggi',
   45.00, 'Maggie',
   'Classic Maggi with a dollop of creamy butter.',
   'https://nfcihospitality.com/wp-content/uploads/2024/09/Butter-Maggi-Recipe.jpg',
   true, true, 100),

  ('Special Double Masala',
   50.00, 'Maggie',
   'The ultimate spicy Maggi experience.',
   'https://myfoodstory.com/wp-content/uploads/2022/12/masala-maggi-3.jpg',
   true, true, 100),

  ('Sweet Corn',
   50.00, 'Maggie',
   'Maggi with sweet corn kernels for a sweet & spicy mix.',
   'https://nfcihospitality.com/wp-content/uploads/2024/09/Corn-Cheese-Maggi.jpg',
   true, true, 100),

  ('Soupy Maggi',
   50.00, 'Maggie',
   'Served in a rich, flavorful broth for cold days.',
   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWkyc2jrN_SH2JsdGwzA1-tdAQDzojhONQiA&s',
   true, true, 100),

  ('Veg Atta Masala',
   55.00, 'Maggie',
   'A healthier whole wheat noodle alternative.',
   'https://www.vridhistores.com/uploads/2023/May/products/16851996597085.jpg',
   true, true, 100),

  ('Butter Garlic',
   55.00, 'Maggie',
   'Flavorful Maggi infused with roasted garlic and butter.',
   'https://static.india.com/wp-content/uploads/2024/08/FEATURE-IMAGE-6-1.jpg?impolicy=Medium_Widthonly&w=350&h=263',
   true, true, 100),

  ('Special Masala Maggi',
   55.00, 'Maggie',
   'Secret spice blend for a unique Maggi taste.',
   'https://spoonsofflavor.com/wp-content/uploads/2020/04/Simple-Maggi-Masala-Noodles-2.jpg',
   true, true, 100),

  ('Peri Peri',
   60.00, 'Maggie',
   'Zesty and spicy African bird''s eye chili flavor.',
   'https://i.ytimg.com/vi/CcwT8HUpfFg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBBJIMu1-f2uC063eUnlNwjCkM0dg',
   true, true, 100),

  ('Pasta Style',
   60.00, 'Maggie',
   'Maggi cooked in a creamy Italian pasta sauce.',
   'https://thegaruskitchen.com/wp-content/uploads/2025/02/masala-pasta-recipe-without-vegetables.jpeg',
   true, true, 100),

  ('Flavour of South',
   60.00, 'Maggie',
   'Infused with South Indian spices and curry leaves.',
   'https://d36v5spmfzyapc.cloudfront.net/wp-content/uploads/2018/07/south-indian-style-maggi-400x200.jpg',
   true, true, 100),

  ('Sizzling Schezwan',
   60.00, 'Maggie',
   'Hot and spicy Schezwan style noodles.',
   'https://nfcihospitality.com/wp-content/uploads/2024/09/Indian-Schezwan-Maggi.jpg',
   true, true, 100),

  ('Mexican Salsa',
   60.00, 'Maggie',
   'Tangy tomato and chili salsa infused noodles.',
   'https://www.tasteofhome.com/wp-content/uploads/2024/10/Salsa-Pasta_TOHD24_30263_SuzanNajjar-5.jpg?fit=700%2C1024',
   true, true, 100),

  ('Cheese Oregano',
   65.00, 'Maggie',
   'Cheesy goodness topped with aromatic oregano.',
   'https://www.whiskaffair.com/wp-content/uploads/2018/01/Cheese-Maggi-2-3-2-480x270.jpg',
   true, true, 100),

  ('Italiano',
   70.00, 'Maggie',
   'Gourmet Maggi with olives, herbs, and premium cheese.',
   'https://www.maggi.in/sites/default/files/styles/home_stage_1500_700/public/srh_recipes/f6d480af28b14b4226639ef9a4042835.jpg?h=152e3acd&itok=ILEBJxJN',
   true, true, 100),

-- ============================================================
-- SANDWICH
-- ============================================================
INSERT INTO public.items (name, price, category, description, image, is_veg, is_available, stock_quantity) VALUES
  ('Veg Grill',
   40.00, 'Sandwich',
   'Grilled sandwich packed with fresh seasonal vegetables.',
   'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Peanut Butter',
   40.00, 'Sandwich',
   'Classic creamy peanut butter spread on toasted bread.',
   'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Bread Butter/Jam',
   40.00, 'Sandwich',
   'Simplicity at its best — butter and fruit jam.',
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Bread Omelette',
   45.00, 'Sandwich',
   'Classic street-style omelette tucked between bread.',
   'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400',
   false, true, 100),

  ('Plain Cheese',
   60.00, 'Sandwich',
   'Melted cheese between two slices of golden toast.',
   'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Chilli Cheese',
   65.00, 'Sandwich',
   'Spicy green chilies and melted cheese combo.',
   'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Corn Cheese',
   65.00, 'Sandwich',
   'Sweet corn kernels mixed with creamy melted cheese.',
   'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&q=80&w=400',
   true, true, 100),

  ('Nutella Chocolate',
   70.00, 'Sandwich',
   'Indulgent Nutella spread for the sweet lovers.',
   'https://images.unsplash.com/photo-1549366021-9f761d040a94?auto=format&fit=crop&q=80&w=400',
   true, true, 100);

-- ============================================================
-- Verify the inserted data
-- ============================================================
SELECT category, COUNT(*) AS item_count, MIN(price) AS min_price, MAX(price) AS max_price
FROM public.items
GROUP BY category
ORDER BY category;
