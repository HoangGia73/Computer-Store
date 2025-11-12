const config = require('../config/env');
const modelProduct = require('../models/products.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!config.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in environment');
}

const gemini = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const chatCompletionTemperature = Number(config.CHATBOT_TEMPERATURE) || 0.7;

const MAX_REQUESTS_PER_MINUTE = Number(config.CHATBOT_REQUEST_LIMIT) || 58;
const MAX_PRODUCTS_IN_CONTEXT = Number(config.CHATBOT_PRODUCTS_LIMIT) || 12;
const PRODUCT_CACHE_TTL_MS = Number(config.CHATBOT_PRODUCT_CACHE_MS) || 60_000;
const MIN_CONVERSATION_INTERVAL_MS = Number(config.CHATBOT_COOLDOWN_MS) || 4_000;

const requestTimestamps = [];
const conversationLocks = new Set();
const conversationCooldowns = new Map();

function buildError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

const DEFAULT_SYSTEM_PROMPT = [
    'Bạn là trợ lý bán hàng thân thiện và chính xác cho cửa hàng máy tính.',
    'Hướng dẫn:',
    '1. Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, ưu tiên giọng lịch sự.',
    '2. Nếu câu hỏi liên quan cấu hình hoặc so sánh, giải thích ngắn gọn nhưng rõ ràng.',
    '3. Nếu thông tin không có trong dữ liệu, thông báo cho khách và gợi ý liên hệ nhân viên.',
    '4. Khi liệt kê nhiều sản phẩm, ưu tiên danh sách với dấu gạch đầu dòng.',
    '5. Giữ giọng điệu gần gũi như nhân viên bán hàng thực thụ, không lan man.',
    '6. Luôn chào hỏi khách trước khi trả lời.',
].join('\n');

const chatSystemPrompt = (config.CHATBOT_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT).split('\\n').join('\n');
const allowedRoles = new Set(['system', 'user', 'assistant', 'model']);

const currencyFormatter = new Intl.NumberFormat('vi-VN');

let productCache = {
    expiresAt: 0,
    lines: [],
};

function formatPrice(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return value;
    }
    return currencyFormatter.format(value);
}

function sanitizeHistory(history = []) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(
            (msg) =>
                msg &&
                typeof msg.role === 'string' &&
                typeof msg.content === 'string' &&
                msg.content.trim().length > 0,
        )
        .map((msg) => ({
            role: allowedRoles.has(msg.role) ? msg.role : 'user',
            content: msg.content.trim(),
        }))
        .slice(-20);
}

async function checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    while (requestTimestamps.length && requestTimestamps[0] < oneMinuteAgo) {
        requestTimestamps.shift();
    }

    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
        const waitMs = requestTimestamps[0] + 60 * 1000 - now;
        const waitTime = Math.max(1, Math.ceil(waitMs / 1000));
        throw buildError(`Chatbot đang xử lý nhiều yêu cầu. Vui lòng đợi ${waitTime}s.`, 429);
    }

    requestTimestamps.push(now);
}

async function getProductLines(limit = MAX_PRODUCTS_IN_CONTEXT) {
    const now = Date.now();
    if (productCache.lines.length && productCache.expiresAt > now) {
        return productCache.lines.slice(0, limit);
    }

    const products = await modelProduct.findAll();
    const formatted = (Array.isArray(products) ? products : [])
        .map((product, index) => {
            const plain = typeof product?.toJSON === 'function' ? product.toJSON() : product;
            const basePrice = Number(plain?.price) || 0;
            const discount = Number(plain?.discount) || 0;
            const finalPrice = discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;
            if (!plain?.name) {
                return null;
            }
            return `- Sản phẩm ${index + 1}: ${plain.name} | Giá: ${formatPrice(finalPrice)} VND`;
        })
        .filter(Boolean);

    productCache = {
        lines: formatted,
        expiresAt: now + PRODUCT_CACHE_TTL_MS,
    };

    return productCache.lines.slice(0, limit);
}

function normalizeAskOptions(input) {
    if (!input) {
        return { history: [], conversationId: undefined };
    }

    if (Array.isArray(input)) {
        return { history: input, conversationId: undefined };
    }

    const history = Array.isArray(input.history) ? input.history : [];
    return { history, conversationId: input.conversationId };
}

function ensureConversationFlow(conversationId) {
    if (!conversationId) {
        return;
    }

    if (conversationLocks.has(conversationId)) {
        throw buildError('Chatbot đang trả lời câu hỏi trước. Vui lòng đợi trong giây lát.', 429);
    }

    if (MIN_CONVERSATION_INTERVAL_MS > 0) {
        const now = Date.now();
        const nextAllowed = conversationCooldowns.get(conversationId) || 0;
        if (now < nextAllowed) {
            const waitSeconds = Math.max(1, Math.ceil((nextAllowed - now) / 1000));
            throw buildError(`Bạn đã hỏi quá nhanh. Vui lòng đợi ${waitSeconds}s trước khi hỏi tiếp.`, 429);
        }
    }

    conversationLocks.add(conversationId);
}

function releaseConversationFlow(conversationId) {
    if (!conversationId) {
        return;
    }
    conversationLocks.delete(conversationId);
    if (MIN_CONVERSATION_INTERVAL_MS > 0) {
        conversationCooldowns.set(conversationId, Date.now() + MIN_CONVERSATION_INTERVAL_MS);
    }
}

async function askQuestion(question, historyOrOptions = []) {
    if (!question || typeof question !== 'string' || !question.trim()) {
        throw buildError('Thiếu câu hỏi', 400);
    }

    const { history, conversationId } = normalizeAskOptions(historyOrOptions);
    const sanitizedHistory = sanitizeHistory(history);

    await checkRateLimit();
    ensureConversationFlow(conversationId);

    try {
        const products = await getProductLines();
        const contextMessage = `Danh sách sản phẩm đang có:\n${
            products.length ? products.join('\n') : '- Không có dữ liệu sản phẩm nào.'
        }`;

        const model = gemini.getGenerativeModel({ model: config.GEMINI_MODEL });
        const geminiHistory = sanitizedHistory.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: chatCompletionTemperature,
                maxOutputTokens: 1024,
            },
        });

        const fullPrompt = `${chatSystemPrompt}\n\n${contextMessage}\n\nCâu hỏi của khách hàng: ${question.trim()}`;
        const result = await chat.sendMessage(fullPrompt);
        const answer = result.response?.text()?.trim() || '';

        const updatedHistory = [
            ...sanitizedHistory,
            { role: 'user', content: question.trim() },
            { role: 'assistant', content: answer || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.' },
        ].slice(-20);

        return { answer, history: updatedHistory };
    } catch (error) {
        if (error?.statusCode) {
            throw error;
        }
        if (error.message?.includes('Rate limit') || error.status === 429) {
            throw buildError('Chatbot tạm thời quá tải. Vui lòng thử lại sau vài giây.', 429);
        }
        const unexpected = buildError('Chatbot gặp sự cố bất ngờ. Vui lòng thử lại sau.', 500);
        unexpected.cause = error;
        throw unexpected;
    } finally {
        releaseConversationFlow(conversationId);
    }
}

module.exports = { askQuestion };
