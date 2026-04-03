const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Export app for importing in api/index.js
module.exports = app;

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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 'Authorization', 'apikey',
        'x-client-info', 'x-supabase-api-version',
        'Prefer', 'Range', 'accept-profile', 'content-profile',
        'if-match', 'if-none-match'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count', 'Location', 'Content-Location']
}));

// ============================================================
// SUPABASE PROXY — Routes all Supabase traffic through backend
// This fixes mobile carrier DNS blocking of supabase.co
// MUST be placed BEFORE express.json() to preserve raw body
// ============================================================
const SUPABASE_TARGET = process.env.SUPABASE_URL || 'https://udzrvxwjakgwfbnatnbt.supabase.co';

app.use('/supabase', createProxyMiddleware({
    target: SUPABASE_TARGET,
    changeOrigin: true,
    pathRewrite: { '^/supabase': '' },
    // Skip WebSocket upgrades — Vercel serverless doesn't support WS.
    // Realtime will reconnect directly to supabase.co for WS.
    ws: false,
    on: {
        proxyReq: (proxyReq, req) => {
            // Forward ALL critical Supabase/PostgREST headers
            const headersToForward = [
                'apikey',
                'authorization',
                'x-client-info',
                'x-supabase-api-version',
                'prefer',
                'range',
                'accept-profile',
                'content-profile',
                'if-match',
                'if-none-match'
            ];

            headersToForward.forEach(h => {
                if (req.headers[h]) {
                    proxyReq.setHeader(h, req.headers[h]);
                }
            });
        },
        error: (err, req, res) => {
            console.error('Supabase proxy error:', err.message);
            res.status(502).json({ error: 'Proxy error reaching Supabase', details: err.message });
        }
    }
}));

app.use(express.json());

// Request logging for debugging routing on Vercel
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw error || new Error('Invalid user');

        req.user = user; // Attach verified user to request
        next();
    } catch (error) {
        console.error('AUTH ERROR:', error.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        hasRazorpay: !!process.env.RAZORPAY_KEY_ID
    });
});

app.get(['/api', '/'], (req, res) => {
    res.send('Nescafe Backend is running! ☕');
});

// Helper to calculate order total securely
async function calculateOrderAmount(items, orderMode, couponApplied) {
    const itemIds = items.map(item => item.id);
    const { data: dbItems, error: dbError } = await supabase
        .from('items')
        .select('id, price')
        .in('id', itemIds);

    if (dbError) throw dbError;

    const priceMap = {};
    dbItems.forEach(item => priceMap[item.id] = item.price);

    let subtotal = 0;
    items.forEach(item => {
        const price = priceMap[item.id] || 0;
        subtotal += price * item.quantity;
    });

    const deliveryFee = (orderMode === 'delivery') ? 10 : 0;
    const discount = couponApplied ? Math.floor(subtotal * 0.2) : 0;
    const totalAfterDiscount = subtotal - discount;
    const taxes = Math.floor(totalAfterDiscount * 0.05);
    const finalTotal = totalAfterDiscount + taxes + deliveryFee;

    return {
        finalTotal,
        subtotal,
        discount,
        taxes,
        deliveryFee,
        priceMap
    };
}

// ============================================================
// PHONE OTP AUTHENTICATION
// ============================================================

// 0. Send OTP
app.post(['/api/auth/send-otp', '/auth/send-otp'], async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        const { error } = await supabase
            .from('phone_otps')
            .insert({ phone, otp, expires_at: expiresAt });

        if (error) throw error;

        // SIMULATED SMS SENDING
        console.log(`[SMS SIMULATION] To: +91${phone}, OTP: ${otp}`);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('SEND OTP ERROR:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 0.1 Verify OTP
app.post(['/api/auth/verify-otp', '/auth/verify-otp'], async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    try {
        const { data, error } = await supabase
            .from('phone_otps')
            .select('*')
            .eq('phone', phone)
            .eq('otp', otp)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // OTP is valid!
        await supabase.from('phone_otps').delete().eq('id', data.id);

        res.status(200).json({ success: true, message: 'Phone verified successfully' });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// 1. Create Order endpoint
// 1. Create Order endpoint
app.post(['/api/create-order', '/create-order'], authenticateUser, async (req, res) => {
    console.log('CREATE ORDER REQUEST RECEIVED'); try {
        const { items, orderMode, couponApplied, currency = 'INR', receipt } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Securely calculate amount on backend
        const { finalTotal } = await calculateOrderAmount(items, orderMode, couponApplied);

        const options = {
            amount: Math.round(finalTotal * 100), // Razorpay expects amount in paise
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
app.post(['/api/verify-payment', '/verify-payment'], authenticateUser, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details
        } = req.body;

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Securely recalculate the amount and get price map
            const { finalTotal, priceMap } = await calculateOrderAmount(
                order_details.items,
                order_details.order_mode,
                order_details.couponApplied
            );

            // Payment verified! Now create order in Supabase
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: req.user.id, // SECURE: Use verified ID from token, not client!
                    total_amount: finalTotal,
                    order_mode: order_details.order_mode,
                    hostel_block: order_details.hostel_block,
                    status: 'preparing',
                    payment_status: 'paid',
                    razorpay_order_id: razorpay_order_id,
                    razorpay_payment_id: razorpay_payment_id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Atomic Inventory Check and Decrement
            for (const item of order_details.items) {
                const { data: stockSuccess, error: stockError } = await supabase
                    .rpc('process_item_order', {
                        item_uuid: item.id,
                        quantity_to_buy: item.quantity
                    });

                if (stockError) throw stockError;

                if (!stockSuccess) {
                    throw new Error(`Item "${item.name}" is no longer in stock. Please contact support for a refund.`);
                }
            }

            // Create order items using SECURE backend prices
            const itemsToInsert = order_details.items.map(item => ({
                order_id: orderData.id,
                item_id: String(item.id),
                name: item.name,
                quantity: item.quantity,
                price: priceMap[item.id] || 0, // Use backend price
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

// 3. Razorpay Webhook handler (Direct from Razorpay)
// 3. Razorpay Webhook handler (Direct from Razorpay)
app.post(['/api/razorpay-webhook', '/razorpay-webhook'], async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('WEBHOOK ERROR: Invalid signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`WEBHOOK RECEIVED: ${event}`);

        if (event === 'order.paid') {
            const razorpayOrderId = payload.order.entity.id;

            // Fail-safe: Update payment status in Supabase if verify-payment didn't finish
            const { error: updateError } = await supabase
                .from('orders')
                .update({ payment_status: 'paid', status: 'preparing' })
                .eq('razorpay_order_id', razorpayOrderId)
                .is('payment_status', 'pending'); // Only update if still pending

            if (updateError) {
                console.error(`WEBHOOK DB UPDATE ERROR: ${updateError.message}`);
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('WEBHOOK HANDLER ERROR:', error);
        res.status(500).send('Webhook process failed');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong!');
});

// Export for Vercel
// Final handle for undefined routes to avoid default Express HTML 404
app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.path}` });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });
}

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
