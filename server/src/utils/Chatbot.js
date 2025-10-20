const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyAjEbh_oyJpw-vGiOTHyEqj4NbAE4FHKNA');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const modelProduct = require('../models/products.model');

async function askQuestion(question) {
    try {
        const products = await modelProduct.findAll({});
        const productData = products
            .map(
                (product) =>
                    `Tên ${product.name}, Giá : ${
                        product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price
                    }`,
            )
            .join('\n');

        const prompt = `
        Bạn là trợ lý bán hàng chăm sóc khách hàng cho cửa hàng máy tính.

            Dữ liệu sản phẩm hiện có:
            ${productData}

            Yêu cầu:
            1. Đọc kỹ câu hỏi của khách: "${question}".
            2. Tư vấn chính xác, thân thiện, bằng tiếng Việt tự nhiên.
            3. Nếu liên quan đến cấu hình hoặc so sánh, giải thích ngắn gọn lý do đề xuất.
            4. Khi thông tin không có trong danh sách, hãy nói rõ và gợi ý khách liên hệ tư vấn viên.

            Bắt đầu trả lời ngay:`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();
        return answer;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { askQuestion };
