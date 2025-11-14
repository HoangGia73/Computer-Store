const axios = require('axios');
const modelProduct = require('../models/products.model');
const config = require('../config/env');

if (!config.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY in environment');
}

const CHATBOT_TEMPERATURE = Number(config.CHATBOT_TEMPERATURE) || 0.7;
const MAX_PRODUCTS_IN_CONTEXT = Number(config.CHATBOT_PRODUCTS_LIMIT) || 15;
const PRODUCT_CACHE_TTL_MS = Number(config.CHATBOT_PRODUCT_CACHE_MS) || 2 * 60 * 1000;

const DEFAULT_SYSTEM_PROMPT = (config.CHATBOT_SYSTEM_PROMPT || `
Bạn là một trợ lý bán hàng chuyên nghiệp của cửa hàng PC.
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, mạch lạc.
- Sử dụng dữ liệu sản phẩm được cung cấp để tư vấn; nếu thiếu thông tin hãy thành thật và gợi ý khách bổ sung thông tin liên hệ.
- Khi giới thiệu nhiều sản phẩm, trình bày dạng danh sách gạch đầu dòng, nêu tên, giá và điểm nổi bật.
- Luôn ưu tiên đưa ra gợi ý cụ thể, phù hợp với nhu cầu trong câu hỏi.
`).trim();

let productCache = {
    expiresAt: 0,
    lines: [],
};

function toPlainProduct(product) {
    if (!product) {
        return null;
    }
    return typeof product.toJSON === 'function' ? product.toJSON() : product;
}

function formatProductLine(product, index) {
    const plain = toPlainProduct(product);
    if (!plain?.name) {
        return null;
    }

    const basePrice = Number(plain.price) || 0;
    const discount = Number(plain.discount) || 0;
    const finalPrice = discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;
    const formattedPrice = finalPrice.toLocaleString('vi-VN');
    const discountNote = discount > 0 ? ` (giảm ${discount}%)` : '';
    return `${index + 1}. ${plain.name} - ${formattedPrice} VND${discountNote}`;
}

async function getProductLines() {
    const now = Date.now();
    if (productCache.lines.length && productCache.expiresAt > now) {
        return productCache.lines;
    }

    const products = await modelProduct.findAll();
    const lines = (Array.isArray(products) ? products : [])
        .map((product, idx) => formatProductLine(product, idx))
        .filter(Boolean)
        .slice(0, MAX_PRODUCTS_IN_CONTEXT);

    productCache = {
        lines,
        expiresAt: now + PRODUCT_CACHE_TTL_MS,
    };

    return lines;
}

function buildPrompt(question, productLines) {
    const productSection = productLines.length
        ? `Danh sách sản phẩm hiện có:\n${productLines.join('\n')}`
        : 'Hiện chưa có dữ liệu sản phẩm. Hãy trả lời dựa trên kinh nghiệm chung và gợi ý liên hệ cửa hàng.';

    return `
${productSection}

Câu hỏi của khách hàng: ${question}

Hãy trả lời ngắn gọn (3-6 câu), nhấn mạnh lợi ích chính và đề xuất rõ ràng.
    `.trim();
}

function buildFallbackAnswer(productLines) {
    if (!productLines.length) {
        return 'Xin lỗi, tôi đang gặp sự cố khi truy vấn dữ liệu. Bạn vui lòng thử lại sau hoặc liên hệ trực tiếp với cửa hàng nhé.';
    }

    return [
        'Tôi tạm thời không thể kết nối tới hệ thống trả lời tự động.',
        'Bạn có thể tham khảo nhanh một vài sản phẩm nổi bật:',
        productLines.slice(0, 3).join('\n'),
        'Nếu cần tư vấn thêm, bạn hãy gửi lại câu hỏi sau ít phút hoặc liên hệ hotline để được hỗ trợ ngay.',
    ].join('\n\n');
}

async function sendPromptToOpenRouter(prompt) {
    const baseUrl = (config.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;

    const response = await axios.post(url, {
        model: config.OPENROUTER_MODEL,
        temperature: CHATBOT_TEMPERATURE,
        messages: [
            { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
        ],
    }, {
        headers: {
            Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
            'HTTP-Referer': config.OPENROUTER_HTTP_REFERER,
            'X-Title': config.OPENROUTER_APP_TITLE,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });

    const choice = response.data?.choices?.[0];
    if (!choice?.message?.content) {
        throw new Error('OpenRouter response missing content');
    }

    const { content } = choice.message;
    if (typeof content === 'string') {
        return content.trim();
    }

    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (!part) {
                    return '';
                }
                if (typeof part === 'string') {
                    return part;
                }
                if (typeof part.text === 'string') {
                    return part.text;
                }
                return '';
            })
            .join('')
            .trim();
    }

    return '';
}

async function askQuestion(question) {
    if (!question || typeof question !== 'string' || !question.trim()) {
        throw new Error('Missing question');
    }

    const trimmedQuestion = question.trim();

    try {
        const productLines = await getProductLines();
        const prompt = buildPrompt(trimmedQuestion, productLines);

        const answer = await sendPromptToOpenRouter(prompt);
        return answer && answer.length
            ? answer
            : buildFallbackAnswer(productLines);
    } catch (error) {
        console.error('Chatbot askQuestion error:', error);
        const productLines = productCache.lines || [];
        return buildFallbackAnswer(productLines);
    }
}

module.exports = { askQuestion };

