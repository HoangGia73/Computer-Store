/**
 * File: sendMailForgotPassword.js
 * Mục đích: Gửi email OTP đặt lại mật khẩu qua Gmail OAuth2
 * Tự động log và lưu refresh token mới nếu Google cấp lại
 */

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

// ======== 🔐 Cấu hình OAuth2 ==========
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const USER_EMAIL = process.env.USER_EMAIL;

// ======== ⚙️ Khởi tạo OAuth2 Client ==========
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Nếu có file token.json thì đọc token lưu sẵn
if (fs.existsSync('./token.json')) {
    const savedTokens = JSON.parse(fs.readFileSync('./token.json'));
    oAuth2Client.setCredentials(savedTokens);
} else {
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

// ======== 🔁 Lắng nghe sự kiện token mới ==========
oAuth2Client.on('tokens', (tokens) => {
    console.log('🟢 Token event detected');
    if (tokens.refresh_token) {
        console.log('🔁 New refresh token received, saving...');
        fs.writeFileSync('./token.json', JSON.stringify(tokens, null, 2));
    } else if (tokens.access_token) {
        console.log('🔑 New access token received');
    }
});

// ======== ✉️ Hàm gửi email ==========
const sendMailForgotPassword = async (email, otp) => {
    try {
        console.log(`📨 Đang gửi email OTP tới: ${email}`);

        // Lấy access token mới
        const accessToken = await oAuth2Client.getAccessToken();

        // Cấu hình Nodemailer transporter
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        // Nội dung email (HTML + text)
        const mailOptions = {
            from: `"PCM Support" <${USER_EMAIL}>`,
            to: email,
            subject: 'Yêu cầu đặt lại mật khẩu',
            text: `Mã OTP của bạn là: ${otp}. OTP sẽ hết hạn sau 5 phút.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #e67e22;">PCM</h2>
                        <p style="color: #555; font-size: 14px;">Yêu cầu đặt lại mật khẩu</p>
                    </div>
                    <p>Xin chào <strong>${email}</strong>,</p>
                    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Mã OTP của bạn là: <strong style="font-size: 18px; color: #e67e22;">${otp}</strong></p>
                    <p>Mã OTP sẽ hết hạn sau 5 phút.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #777;">Trân trọng,</p>
                    <p style="text-align: center; color: #e67e22; font-size: 18px;">Đội ngũ PCM</p>
                </div>
            `,
        };

        // Gửi email
        const result = await transport.sendMail(mailOptions);
        console.log('✅ Gửi email thành công:', result.messageId);
        return { success: true, message: 'Email đã được gửi thành công' };

    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error.message);
        console.error(error);
        return { success: false, message: error.message };
    }
};

module.exports = sendMailForgotPassword;
