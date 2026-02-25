const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('FATAL ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize Supabase (Admin access for updating orders)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Nescafe Backend is running! ☕');
});

// 1. Create Order endpoint
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('RAZORPAY ORDER ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Verify Payment endpoint
app.post('/api/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details // Custom metadata we send from frontend
        } = req.body;

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment verified! Now create order in Supabase
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: order_details.user_id,
                    total_amount: order_details.total_amount,
                    order_mode: order_details.order_mode,
                    hostel_block: order_details.hostel_block,
                    status: 'preparing',
                    payment_status: 'paid', // Mark as paid
                    razorpay_order_id: razorpay_order_id,
                    razorpay_payment_id: razorpay_payment_id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const itemsToInsert = order_details.items.map(item => ({
                order_id: orderData.id,
                item_id: String(item.id),
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                variant: item.selectedVariant || 'Standard',
                customization: item.customization || []
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            res.status(200).json({ status: 'success', orderId: orderData.id });
        } else {
            res.status(400).json({ status: 'failure', message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('PAYMENT VERIFICATION ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
