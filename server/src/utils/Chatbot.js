const config = require('../config/env');
const modelProduct = require('../models/products.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
if (!config.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in environment');
}

const gemini = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const chatCompletionTemperature = parseFloat(config.CHATBOT_TEMPERATURE) || 0.7;

console.log('✅ Chatbot initialized with Google Gemini');
console.log('📝 Model:', config.GEMINI_MODEL);

// System prompt
const DEFAULT_SYSTEM_PROMPT = [
    'Bạn là trợ lý bán hàng thân thiện và chính xác cho cửa hàng máy tính.',
    'Yêu cầu:',
    '1. Trả lời bằng tiếng Việt tự nhiên, sắc thái.',
    '2. Nếu câu hỏi liên quan cấu hình hoặc so sánh, hãy giải thích ngắn gọn lý do đề xuất.',
    '3. Nếu thông tin không có trong danh sách, hãy thông báo và gợi ý khách liên hệ tư vấn viên.',
    '4. Khi liệt kê nhiều sản phẩm, hãy trình bày mỗi sản phẩm trên một dòng riêng, ưu tiên dạng gạch đầu dòng hoặc số thứ tự.',
    '5. Bạn luôn cố gắng giúp khách chọn được sản phẩm phù hợp, nói chuyện tự nhiên như người thật, không quá dài dòng.',
    '6. Luôn chào hỏi khách hàng một cách thân thiện trước khi trả lời câu hỏi.',
].join('\n');

const chatSystemPrompt = (config.CHATBOT_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT).split('\\n').join('\n');

const currencyFormatter = new Intl.NumberFormat('vi-VN');

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

    const allowedRoles = new Set(['system', 'user', 'assistant', 'model']);

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

async function askQuestion(question, history = []) {
    if (!question || typeof question !== 'string' || !question.trim()) {
        throw new Error('Missing question');
    }

    try {
        console.log('🤖 Chatbot: Fetching products from database...');
        const products = await modelProduct.findAll({});
        console.log(`✅ Found ${products.length} products`);

        const productData = products
            .map((product, index) => {
                const basePrice = Number(product.price) || 0;
                const discount = Number(product.discount) || 0;
                const finalPrice = discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;

                return `- Sản phẩm ${index + 1}: ${product.name} | Giá: ${formatPrice(finalPrice)} VND`;
            })
            .join('\n');

        const sanitizedHistory = sanitizeHistory(history);
        console.log(`📜 Sanitized history: ${sanitizedHistory.length} messages`);

        const contextMessage = `Danh sách sản phẩm hiện có:\n${productData || '- Không có dữ liệu sản phẩm hiện tại.'}`;

        // Gemini implementation
        const model = gemini.getGenerativeModel({ model: config.GEMINI_MODEL });

        // Convert history to Gemini format (assistant -> model)
        const geminiHistory = sanitizedHistory.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // Create chat with history
        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: chatCompletionTemperature,
                maxOutputTokens: 2048,
            },
        });

        // Build prompt with system instruction and context
        const fullPrompt = `${chatSystemPrompt}\n\n${contextMessage}\n\nCâu hỏi của khách hàng: ${question.trim()}`;

        console.log('🚀 Calling Google Gemini API...');
        const result = await chat.sendMessage(fullPrompt);
        console.log('✅ Gemini response received');

        const answer = result.response.text().trim();

        const updatedHistory = [
            ...sanitizedHistory,
            { role: 'user', content: question.trim() },
            { role: 'assistant', content: answer },
        ].slice(-20);

        return { answer, history: updatedHistory };
    } catch (error) {
        console.error('Chatbot askQuestion error:', error);
        throw error;
    }
}

module.exports = { askQuestion };