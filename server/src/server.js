require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const { connectDB } = require('./config/index');
const routes = require('./routes/index');
const syncDatabase = require('./models/sync');
const { askQuestion } = require('./utils/Chatbot');

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

app.set('trust proxy', 1);

const defaultClientUrl = 'http://localhost:5173';
const rawClientUrls = process.env.CLIENT_URLS || process.env.CLIENT_URL || defaultClientUrl || 'http://shop-pc-client.web.app';
const allowedOrigins = rawClientUrls
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        credentials: true,
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.warn(`Blocked CORS request from origin: ${origin}`);
            return callback(null, false);
        },
    }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();
syncDatabase();

const conversationStore = new Map();

app.post('/api/chat', async (req, res) => {
    try {
        const { question, conversationId } = req.body;

        if (!question || typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({ success: false, message: 'Cau hoi khong hop le.' });
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

        const previousHistory = conversationStore.get(key) || [];
        const { answer, history } = await askQuestion(question, previousHistory);

        conversationStore.set(key, history);

        return res.status(200).json({ answer, conversationId: key });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ success: false, message: 'Loi server' });
    }
});

routes(app);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../src')));

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Loi server',
    });
});

app.listen(port, host, () => {
    console.log(`Example app listening on http://${host}:${port}`);
});



