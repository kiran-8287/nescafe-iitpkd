const axios = require('axios');

/**
 * Sends an OTP SMS via MSG91 in production.
 * Falls back to console.log in development/test.
 */
async function sendOTP(phone, otp) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV SMS] To: +91${phone}, OTP: ${otp}`);
        return { success: true };
    }

    if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
        console.error('FATAL: MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing in .env');
        return { success: false, error: 'SMS configuration missing' };
    }

    try {
        const response = await axios.post(
            'https://api.msg91.com/api/v5/otp',
            {
                template_id: process.env.MSG91_TEMPLATE_ID,
                mobile: `91${phone}`,
                authkey: process.env.MSG91_AUTH_KEY,
                otp: otp,
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
        );

        if (response.data?.type === 'success') {
            return { success: true };
        }
        console.error('MSG91 non-success response:', response.data);
        return { success: false, error: response.data?.message || 'SMS delivery failed' };
    } catch (err) {
        const detail = err.response?.data || err.message;
        console.error('MSG91 sendOTP error:', detail);
        return { success: false, error: typeof detail === 'string' ? detail : JSON.stringify(detail) };
    }
}

module.exports = { sendOTP };
