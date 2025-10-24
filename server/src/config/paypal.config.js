const paypal = require('@paypal/checkout-server-sdk');

/**
 * PayPal Configuration
 *
 * Cấu hình kết nối với PayPal API
 * Hỗ trợ 2 môi trường: Sandbox (test) và Live (production)
 *
 * Cách sử dụng:
 * 1. Đăng ký tài khoản PayPal Developer: https://developer.paypal.com
 * 2. Tạo ứng dụng mới trong Dashboard
 * 3. Lấy Client ID & Secret từ tab Sandbox hoặc Live
 * 4. Thêm vào file .env:
 *    PAYPAL_CLIENT_ID=your_client_id
 *    PAYPAL_CLIENT_SECRET=your_client_secret
 *    PAYPAL_MODE=sandbox (hoặc live)
 */

/**
 * Khởi tạo PayPal Environment (Sandbox hoặc Live)
 * @returns {PayPalEnvironment} PayPal environment instance
 */
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_CLIENT_SECRET';
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    // Production environment - dùng cho thanh toán thật
    if (mode === 'live') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    }
    // Sandbox environment - dùng cho testing
    else {
        return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
}

/**
 * Tạo PayPal HTTP Client để gọi API
 * Client này được sử dụng để tạo order, capture payment, refund, etc.
 * @returns {PayPalHttpClient} PayPal HTTP client instance
 */
function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

module.exports = { client };
