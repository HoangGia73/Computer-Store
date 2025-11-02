const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

const { connectDB } = require('./config/index');
const routes = require('./routes/index');
const syncDatabase = require('./models/sync');
const { askQuestion } = require('./utils/Chatbot');

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
            return res.status(400).json({ success: false, message: 'Câu hỏi không hợp lệ.' });
        }

        let key = conversationId || req.cookies.conversationId;

        if (!key) {
            key = crypto.randomUUID();
            res.cookie('conversationId', key, { httpOnly: false, sameSite: 'lax' });
        }

        const previousHistory = conversationStore.get(key) || [];
        const { answer, history } = await askQuestion(question, previousHistory);

        conversationStore.set(key, history);

        return res.status(200).json({ answer, conversationId: key });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
        });
    }
});

routes(app);

app.use(express.static(path.join(__dirname, '../src')));

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
