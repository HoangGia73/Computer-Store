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
Ban la mot tro ly ban hang chuyen nghiep cua cua hang PC.
- Tra loi bang tieng Viet tu nhien, than thien, mach lac.
- Su dung du lieu san pham duoc cung cap de tu van; neu thieu thong tin hay thanh that va goi y khach bo sung thong tin lien he.
- Khi gioi thieu nhieu san pham, trinh bay dang danh sach gach dau dong, neu ten, gia va diem noi bat.
- Luon uu tien dua ra goi y cu the, phu hop voi nhu cau trong cau hoi.
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
    const discountNote = discount > 0 ? ` (giam ${discount}%)` : '';
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
        ? `Danh sach san pham hien co:\n${productLines.join('\n')}`
        : 'Hien chua co du lieu san pham. Hay tra loi dua tren kinh nghiem chung va goi y lien he cua hang.';

    return `
${productSection}

Cau hoi cua khach hang: ${question}

Hay tra loi ngan gon (3-6 cau), nhan manh loi ich chinh va de xuat ro rang.
    `.trim();
}

function buildFallbackAnswer(productLines) {
    if (!productLines.length) {
        return 'Xin loi, toi dang gap su co khi truy van du lieu. Ban vui long thu lai sau hoac lien he truc tiep voi cua hang nhe.';
    }

    return [
        'Toi tam thoi khong the ket noi toi he thong tra loi tu dong.',
        'Ban co the tham khao nhanh mot vai san pham noi bat:',
        productLines.slice(0, 3).join('\n'),
        'Neu can tu van them, ban hay gui lai cau hoi sau it phut hoac lien he hotline de duoc ho tro ngay.',
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

