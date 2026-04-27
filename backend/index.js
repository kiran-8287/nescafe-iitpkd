const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const { sendOTP } = require('./utils/sms');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy (needed for rate limiting behind Vercel/Nginx)
app.set('trust proxy', 1);

// Export app for importing in api/index.js
module.exports = app;

// ── Razorpay ─────────────────────────────────────────────────
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('FATAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env');
}
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Supabase (admin access for order writes) ─────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── CORS — simplified for development ────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // In development, allow everything to unblock the user immediately.
        // In production, we'll use the strict whitelist.
        if (process.env.NODE_ENV !== 'production' || !origin) {
            return callback(null, true);
        }
        
        const allowed = ['https://nescafe-iitpkd.vercel.app', 'https://nescafeiitpkd.vercel.app', 'https://nescafe.iitpkd.ac.in'].includes(origin);
        if (allowed) {
            callback(null, true);
        } else {
            console.error(`CORS BLOCKED: Origin ${origin} not in whitelist`);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: [
        'Content-Type', 'Authorization', 'apikey',
        'x-client-info', 'x-supabase-api-version',
        'Prefer', 'Range', 'accept-profile', 'content-profile',
        'if-match', 'if-none-match'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count', 'Location', 'Content-Location']
}));

// ── Supabase Proxy — fixes mobile carrier DNS blocking ───────
const SUPABASE_TARGET = process.env.SUPABASE_URL || 'https://udzrvxwjakgwfbnatnbt.supabase.co';

app.use('/supabase', createProxyMiddleware({
    target: SUPABASE_TARGET,
    changeOrigin: true,
    pathRewrite: { '^/supabase': '' },
    ws: false,
    on: {
        proxyReq: (proxyReq, req) => {
            const headersToForward = [
                'apikey', 'authorization', 'x-client-info',
                'x-supabase-api-version', 'prefer', 'range',
                'accept-profile', 'content-profile', 'if-match', 'if-none-match'
            ];
            headersToForward.forEach(h => {
                if (req.headers[h]) proxyReq.setHeader(h, req.headers[h]);
            });
        },
        error: (err, req, res) => {
            console.error('Supabase proxy error:', err.message);
            res.status(502).json({ error: 'Proxy error reaching Supabase', details: err.message });
        }
    }
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ── Rate Limiters ─────────────────────────────────────────────
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutes
    max: 3,
    keyGenerator: (req) => req.body?.phone || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Completely disable validation to prevent ERR_ERL_KEY_GEN_IPV6 crash
    message: { error: 'Too many OTP requests. Please wait 10 minutes before trying again.' }
});

const orderLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 minute
    max: 5,
    keyGenerator: (req) => req.user?.id || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: 'Too many order attempts. Please slow down.' }
});

// ── Auth Middleware ───────────────────────────────────────────
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw error || new Error('Invalid user');
        req.user = user;
        next();
    } catch (error) {
        console.error('AUTH ERROR:', error.message);
        res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
};

// ── Admin Middleware ──────────────────────────────────────────
const authenticateAdmin = async (req, res, next) => {
    // Run after authenticateUser (req.user is already set)
    try {
        const { data: admin } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', req.user.id)
            .maybeSingle();
        if (!admin) return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
        next();
    } catch (err) {
        console.error('ADMIN CHECK ERROR:', err.message);
        res.status(500).json({ error: 'Admin check failed', code: 'SERVER_ERROR' });
    }
};

// ── Helper: server-side price calculation ────────────────────
async function calculateOrderAmount(items, orderMode, couponApplied) {
    const itemIds = items.map(item => item.id);
    const { data: dbItems, error: dbError } = await supabase
        .from('items')
        .select('id, price, image')
        .in('id', itemIds);

    if (dbError) throw dbError;

    const priceMap = {};
    const imageMap = {};
    dbItems.forEach(item => {
        priceMap[item.id] = item.price;
        imageMap[item.id] = item.image;
    });

    let subtotal = 0;
    items.forEach(item => {
        subtotal += (priceMap[item.id] || 0) * item.quantity;
    });

    const deliveryFee = orderMode === 'delivery' ? 10 : 0;
    const discount = couponApplied ? Math.floor(subtotal * 0.2) : 0;
    const totalAfterDiscount = subtotal - discount;
    const taxes = Math.floor(totalAfterDiscount * 0.05);
    const finalTotal = totalAfterDiscount + taxes + deliveryFee;

    return { finalTotal, subtotal, discount, taxes, deliveryFee, priceMap, imageMap };
}

// ── Health & Root ─────────────────────────────────────────────
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


/* 
// ════════════════════════════════════════════════════════════
// PHONE OTP AUTHENTICATION (DISABLED BY USER REQUEST)
// ════════════════════════════════════════════════════════════

// POST /api/auth/send-otp
app.post(['/api/auth/send-otp', '/auth/send-otp'], otpLimiter, async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Valid 10-digit phone number is required', code: 'INVALID_PHONE' });
    }

    try {
        await supabase.rpc('cleanup_expired_otps');

        const { data: existing } = await supabase
            .from('phone_otps')
            .select('id, expires_at')
            .eq('phone', phone)
            .gte('expires_at', new Date().toISOString())
            .maybeSingle();

        if (existing) {
            return res.status(429).json({
                error: 'An OTP was already sent to this number. Please wait before requesting another.',
                code: 'OTP_ALREADY_SENT'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        const { error } = await supabase
            .from('phone_otps')
            .insert({ phone, otp, expires_at: expiresAt });

        if (error) throw error;

        const smsResult = await sendOTP(phone, otp);
        if (!smsResult.success) {
            console.error('SMS delivery failed:', smsResult.error);
            if (process.env.NODE_ENV === 'production') {
                return res.status(502).json({ error: 'Failed to send OTP. Please try again.', code: 'SMS_FAILURE' });
            }
        }

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('SEND OTP ERROR:', error);
        res.status(500).json({ error: 'Failed to send OTP', code: 'SERVER_ERROR' });
    }
});

// POST /api/auth/verify-otp
app.post(['/api/auth/verify-otp', '/auth/verify-otp'], async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required', code: 'MISSING_FIELDS' });
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
            return res.status(400).json({ error: 'Invalid or expired OTP', code: 'INVALID_OTP' });
        }

        await supabase.from('phone_otps').delete().eq('id', data.id);

        res.status(200).json({ success: true, message: 'Phone verified successfully' });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ error: 'Verification failed', code: 'SERVER_ERROR' });
    }
});
*/


// ════════════════════════════════════════════════════════════
// ORDER CREATION
// ════════════════════════════════════════════════════════════

// POST /api/create-order — creates a Razorpay order (does NOT write to our DB yet)
// POST /api/create-order — creates a Razorpay order (does NOT write to our DB yet)
/*
app.post(['/api/create-order', '/create-order'], authenticateUser, orderLimiter, async (req, res) => {
    console.log('CREATE ORDER REQUEST RECEIVED');
    try {
        const { items, orderMode, couponApplied, currency = 'INR', receipt } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty', code: 'EMPTY_CART' });
        }

        // ── Café open/closed check ────────────────────────────
        const { data: cafeSetting } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'cafe_open')
            .single();

        if (cafeSetting?.value !== 'true') {
            return res.status(503).json({
                error: 'The café is currently closed. Please try again later.',
                code: 'CAFE_CLOSED'
            });
        }

        // Securely calculate amount on backend
        const { finalTotal } = await calculateOrderAmount(items, orderMode, couponApplied);

        const order = await razorpay.orders.create({
            amount: Math.round(finalTotal * 100), // paise
            currency,
            receipt,
        });

        res.status(200).json(order);
    } catch (error) {
        console.error('RAZORPAY ORDER ERROR:', error);
        res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
    }
});
*/

// ════════════════════════════════════════════════════════════
// PAYMENT VERIFICATION
// ════════════════════════════════════════════════════════════

// POST /api/verify-payment — verifies HMAC signature, then atomically creates order in DB
/*
app.post(['/api/verify-payment', '/verify-payment'], authenticateUser, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_details
        } = req.body;

        // ── Idempotency Guard ─────────────────────────────────
        // If this razorpay_order_id was already processed, return success immediately.
        // Handles: client retries on network drop, duplicate webhook delivery, etc.
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, status')
            .eq('razorpay_order_id', razorpay_order_id)
            .maybeSingle();

        if (existingOrder) {
            console.log(`[IDEMPOTENT] Order already exists for ${razorpay_order_id}`);
            return res.status(200).json({ status: 'success', orderId: existingOrder.id });
        }

        // ── HMAC Signature Verification ───────────────────────
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ status: 'failure', message: 'Invalid signature', code: 'INVALID_SIGNATURE' });
        }

        // ── Recalculate amount server-side ────────────────────
        const { finalTotal, priceMap, imageMap } = await calculateOrderAmount(
            order_details.items,
            order_details.order_mode,
            order_details.couponApplied
        );

        // ── Build items payload for the atomic RPC ────────────
        const itemsForRPC = order_details.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: priceMap[item.id] || 0,        // Backend-verified price
            variant: item.selectedVariant || 'Standard',
            customization: item.customization || [],
            image_url: imageMap[item.id] || ''     // for Quick Reorder feature
        }));

        // ── Atomic DB operation: insert order + decrement stock + insert order_items ──
        // If any step fails (e.g., stock ran out mid-payment), the entire transaction
        // is rolled back automatically by PostgreSQL — no orphaned records.
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_atomic', {
            p_user_id:              req.user.id,   // from verified JWT — not from client
            p_total_amount:         finalTotal,
            p_order_mode:           order_details.order_mode,
            p_hostel_block:         order_details.hostel_block || null,
            p_razorpay_order_id:    razorpay_order_id,
            p_razorpay_payment_id:  razorpay_payment_id,
            p_items:                itemsForRPC
        });

        if (rpcError) throw rpcError;

        if (!rpcResult.success) {
            const errorMsg = rpcResult.error || '';
            if (errorMsg.includes('STOCK_FAILURE:')) {
                const itemName = errorMsg.split('STOCK_FAILURE:')[1];
                // Payment was captured but order can't be created — log for manual refund
                await supabase.from('payment_alerts').insert({
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount: Math.round(finalTotal * 100),
                    event: `STOCK_FAILURE: ${itemName}`
                });
                return res.status(409).json({
                    error: `"${itemName}" just sold out during your payment. You will receive a full refund within 5–7 business days.`,
                    code: 'STOCK_FAILURE'
                });
            }
            throw new Error(rpcResult.error);
        }

        res.status(200).json({ status: 'success', orderId: rpcResult.order_id });

    } catch (error) {
        console.error('PAYMENT VERIFICATION ERROR:', error);
        res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
    }
});
*/

// ════════════════════════════════════════════════════════════
// RAZORPAY WEBHOOK
// ════════════════════════════════════════════════════════════
/*
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
            console.error('WEBHOOK: Invalid signature');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload;
        console.log(`WEBHOOK RECEIVED: ${event}`);

        if (event === 'order.paid') {
            const razorpayOrderId = payload.order.entity.id;
            const razorpayPaymentId = payload.payment?.entity?.id;

            // Check if an order row exists for this razorpay_order_id
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id, payment_status')
                .eq('razorpay_order_id', razorpayOrderId)
                .maybeSingle();

            if (existingOrder) {
                // Order row exists but may still be in pending payment status — fix it
                if (existingOrder.payment_status !== 'paid') {
                    await supabase
                        .from('orders')
                        .update({ payment_status: 'paid', status: 'preparing' })
                        .eq('id', existingOrder.id);
                }
            } else {
                // No order row exists — this means /verify-payment failed silently.
                // Log for manual review and refund processing.
                console.error('WEBHOOK ALERT: Orphaned payment detected!', razorpayOrderId);
                await supabase.from('payment_alerts').insert({
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: razorpayPaymentId,
                    amount: payload.order.entity.amount,
                    event: 'ORPHANED_PAYMENT'
                });
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('WEBHOOK HANDLER ERROR:', error);
        res.status(500).send('Webhook process failed');
    }
});
*/

// ════════════════════════════════════════════════════════════
// COD (UPI/CASH) ORDER PLACEMENT
// ════════════════════════════════════════════════════════════

app.post(['/api/place-order-cod', '/place-order-cod'], authenticateUser, orderLimiter, async (req, res) => {
    try {
        const { items, orderMode, couponApplied, paymentMethod, hostelDetails } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty', code: 'EMPTY_CART' });
        }

        if (!['cod_upi', 'cod_cash'].includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method', code: 'INVALID_PAYMENT_METHOD' });
        }

        // ── Café open/closed check ────────────────────────────
        const { data: cafeSetting } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'cafe_open')
            .single();

        if (cafeSetting?.value !== 'true') {
            return res.status(503).json({
                error: 'The café is currently closed. Please try again later.',
                code: 'CAFE_CLOSED'
            });
        }

        // Securely calculate amount on backend
        const { finalTotal, priceMap, imageMap } = await calculateOrderAmount(items, orderMode, couponApplied);

        const itemsForRPC = items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: priceMap[item.id] || 0,
            variant: item.selectedVariant || 'Standard',
            customization: item.customization || [],
            image_url: imageMap[item.id] || ''
        }));

        const fakeOrderId = `cod_${Date.now()}`;
        
        // ── Atomic DB operation ──
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_atomic', {
            p_user_id:              req.user.id,
            p_total_amount:         finalTotal,
            p_order_mode:           orderMode,
            p_hostel_block:         orderMode === 'delivery' ? (hostelDetails?.block || null) : null,
            p_razorpay_order_id:    fakeOrderId,
            p_razorpay_payment_id:  paymentMethod, // Store payment method here temporarily
            p_items:                itemsForRPC
        });

        if (rpcError) throw rpcError;

        if (!rpcResult.success) {
            const errorMsg = rpcResult.error || '';
            if (errorMsg.includes('STOCK_FAILURE:')) {
                const itemName = errorMsg.split('STOCK_FAILURE:')[1];
                return res.status(409).json({
                    error: `"${itemName}" just sold out. Please remove it from your cart.`,
                    code: 'STOCK_FAILURE'
                });
            }
            throw new Error(rpcResult.error);
        }

        // Fix the payment_status from 'paid' to the actual COD method
        await supabase
            .from('orders')
            .update({ payment_status: paymentMethod })
            .eq('id', rpcResult.order_id);

        res.status(200).json({ status: 'success', orderId: rpcResult.order_id });

    } catch (error) {
        console.error('COD ORDER ERROR:', error);
        res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
    }
});



// ════════════════════════════════════════════════════════════
// ADMIN: CANCEL ORDER
// ════════════════════════════════════════════════════════════

// POST /api/cancel-order — admin only
app.post(['/api/cancel-order', '/cancel-order'], authenticateUser, authenticateAdmin, async (req, res) => {
    const { order_id } = req.body;
    if (!order_id) {
        return res.status(400).json({ error: 'order_id is required', code: 'MISSING_FIELDS' });
    }

    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', order_id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                error: `Cannot cancel an order that is already "${order.status}".`,
                code: 'INVALID_STATUS_TRANSITION'
            });
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order_id);

        if (updateError) throw updateError;

        res.status(200).json({ status: 'cancelled', orderId: order_id });
    } catch (error) {
        console.error('CANCEL ORDER ERROR:', error);
        res.status(500).json({ error: error.message, code: 'SERVER_ERROR' });
    }
});


// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: 'Something went wrong!', code: 'SERVER_ERROR' });
});

// ── 404 catch-all ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.path}`, code: 'NOT_FOUND' });
});

// ── Start server ──────────────────────────────────────────────
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });
}

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
