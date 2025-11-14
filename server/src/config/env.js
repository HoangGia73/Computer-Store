// config/env.js
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

// Fallback nếu không tìm thấy file .env cụ thể (ví dụ: chạy trực tiếp node index.js)
if (!process.env.JWT_SECRET) {
    require('dotenv').config({ path: '.env' });
}

// Helper: Kiểm tra biến bắt buộc
const requireEnv = (name) => {
    if (!process.env[name]) {
        console.error(`Missing required environment variable: ${name}`);
        process.exit(1);
    }
    return process.env[name];
};

// Export config
module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    SERVER_URL: requireEnv('SERVER_URL'),
    API_BASE_URL: requireEnv('API_BASE_URL'),

    CLIENT_URLS: (process.env.CLIENT_URLS || 'http://localhost:5173')
        .split(',')
        .map(url => url.trim())
        .filter(Boolean),

    SECRET_CRYPTO: requireEnv('SECRET_CRYPTO'),
    JWT_SECRET: requireEnv('JWT_SECRET'),

    // Gmail OAuth2
    USER_EMAIL: requireEnv('USER_EMAIL'),
    CLIENT_ID: requireEnv('CLIENT_ID'),
    CLIENT_SECRET: requireEnv('CLIENT_SECRET'),
    REDIRECT_URI: requireEnv('REDIRECT_URI'),
    REFRESH_TOKEN: requireEnv('REFRESH_TOKEN'),

    // PayPal
    PAYPAL_CLIENT_ID: requireEnv('PAYPAL_CLIENT_ID'),
    PAYPAL_CLIENT_SECRET: requireEnv('PAYPAL_CLIENT_SECRET'),
    PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox',

    // Chatbot - OpenRouter
    OPENROUTER_API_KEY: requireEnv('OPENROUTER_API_KEY'),
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'mistralai/mistral-small-3.1-24b-instruct:free',
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    OPENROUTER_HTTP_REFERER: requireEnv('OPENROUTER_HTTP_REFERER'),
    OPENROUTER_APP_TITLE: requireEnv('OPENROUTER_APP_TITLE'),
    CHATBOT_TEMPERATURE: process.env.CHATBOT_TEMPERATURE || '0.7',
    CHATBOT_SYSTEM_PROMPT: process.env.CHATBOT_SYSTEM_PROMPT || '',

    // Database
    DB_HOST: requireEnv('DB_HOST'),
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: requireEnv('DB_USER'),
    DB_PASSWORD: requireEnv('DB_PASSWORD'),
    DB_NAME: requireEnv('DB_NAME'),
};
