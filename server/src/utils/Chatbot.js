const config = require('../config/env');
const OpenAI = require('openai');

const modelProduct = require('../models/products.model');

const openAiApiKey = config.OPENAI_API_KEY;
if (!openAiApiKey) {
    throw new Error('Missing environment variable OPENAI_API_KEY');
}

const chatCompletionsModel = config.OPENAI_CHAT_COMPLETIONS_MODEL || 'gpt-4o-mini';
const parsedTemperature = Number.parseFloat(config.OPENAI_CHATBOT_TEMPERATURE);
const chatCompletionTemperature = Number.isFinite(parsedTemperature) ? parsedTemperature : 0.7;
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
const chatSystemPrompt = (process.env.OPENAI_CHATBOT_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT).split('\\n').join('\n');

const openai = new OpenAI({
    apiKey: openAiApiKey,
});

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

    const allowedRoles = new Set(['system', 'user', 'assistant']);

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
        const products = await modelProduct.findAll({});
        const productData = products
            .map((product, index) => {
                const basePrice = Number(product.price) || 0;
                const discount = Number(product.discount) || 0;
                const finalPrice = discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;

                return `- Sản phẩm ${index + 1}: ${product.name} | Giá: ${formatPrice(finalPrice)} VND`;
            })
            .join('\n');

        const sanitizedHistory = sanitizeHistory(history);

        const messages = [
            { role: 'system', content: chatSystemPrompt },
            {
                role: 'system',
                content: `Danh sách sản phẩm hiện có:\n${productData || '- Không có dữ liệu sản phẩm hiện tại.'}`,
            },
            ...sanitizedHistory,
            { role: 'user', content: question.trim() },
        ];

        const completion = await openai.chat.completions.create({
            model: chatCompletionsModel,
            messages,
            temperature: chatCompletionTemperature,
        });

        const answer = completion.choices[0]?.message?.content?.trim() || '';
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
