const express = require('express');
const crypto = require('crypto');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// === IMPORT CONFIG ===
const config = require('./config/env');
const { connectDB } = require('./config/index');
const routes = require('./routes/index');
const syncDatabase = require('./models/sync');
const { askQuestion } = require('./utils/Chatbot');

// === CẤU HÌNH ===
const port = config.PORT;
const host = config.HOST;
const isProduction = config.NODE_ENV === 'production';

app.set('trust proxy', 1);

// CORS
app.use(
    cors({
        credentials: true,
        origin(origin, callback) {
            if (!origin || config.CLIENT_URLS.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`Blocked CORS request from origin: ${origin}`);
            return callback(null, false);
        },
    })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// === KẾT NỐI DB ===
connectDB();
syncDatabase();

// === CHATBOT API ===
const conversationStore = new Map();

app.post('/api/chat', async (req, res) => {
    try {
        console.log('📩 Chat request received:', { question: req.body.question });

        const { question, conversationId } = req.body;

        if (!question || typeof question !== 'string' || !question.trim()) {
            console.log('❌ Invalid question');
            return res.status(400).json({ success: false, message: 'Câu hỏi không hợp lệ.' });
        }

        let key = conversationId || req.cookies.conversationId;

        if (!key) {
            key = crypto.randomUUID();
            res.cookie('conversationId', key, {
                httpOnly: false,
                sameSite: isProduction ? 'none' : 'lax',
                secure: isProduction,
            });
        }

        console.log('🔑 Conversation ID:', key);

        const previousHistory = conversationStore.get(key) || [];
        console.log('📜 Previous history length:', previousHistory.length);

        console.log('🤖 Calling askQuestion...');
        const { answer, history } = await askQuestion(question, previousHistory);
        console.log('✅ Got answer, length:', answer?.length);

        conversationStore.set(key, history);

        return res.status(200).json({ answer, conversationId: key });
    } catch (error) {
        console.error('❌ Chat API error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

// === ROUTES ===
routes(app);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../src')));

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

// === START SERVER ===
app.listen(port, host, () => {
    console.log(`Server running at ${config.SERVER_URL}`);
    console.log(`Mode: ${config.NODE_ENV}`);
});