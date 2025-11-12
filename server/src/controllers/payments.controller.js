const modelPayments = require('../models/payments.model');
const modelCart = require('../models/cart.model');
const modelUsers = require('../models/users.model');
const modelProducts = require('../models/products.model');

const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const axios = require('axios');
const crypto = require('crypto');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { log } = require('util');

// PayPal SDK
const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../config/paypal.config');

const config = require('../config/env');

const defaultApiBaseUrl = 'http://localhost:3000';
const defaultClientBaseUrl = 'http://localhost:5173';
const appBaseUrl = process.env.API_BASE_URL || defaultApiBaseUrl;
const clientBaseUrl = process.env.CLIENT_URL || defaultClientBaseUrl;
const paypalReturnUrl = process.env.PAYPAL_RETURN_URL || `${appBaseUrl}/api/check-payment-paypal`;
const paypalCancelUrl = process.env.PAYPAL_CANCEL_URL || `${clientBaseUrl}/cart?payment=cancelled`;
const vnpReturnUrl = process.env.VNP_RETURN_URL || `${appBaseUrl}/api/check-payment-vnpay`;
const vnpHost = process.env.VNP_HOST || 'https://sandbox.vnpayment.vn';
const vnpTestMode = process.env.VNP_TEST_MODE ? process.env.VNP_TEST_MODE === 'true' : true;
const vnpTmnCode = process.env.VNP_TMN_CODE || 'DH2F13SW';
const vnpHashSecret = process.env.VNP_HASH_SECRET || '7VJPG70RGPOWFO47VSBT29WPDYND0EJG';

/**
 * Hàm tạo mã ID thanh toán duy nhất
 * Format: PAY + timestamp + seconds + milliseconds
 * Ví dụ: PAY172982340015123456
 */
function generatePayID() {
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

class PaymentsController {
    /**
     * Xử lý thanh toán cho các phương thức: COD, PayPal, VNPay
     * @param {Object} req - Request object chứa thông tin user và typePayment
     * @param {Object} res - Response object
     */
    async payments(req, res) {
        const { id } = req.user;
        const { typePayment } = req.body;

        // Lấy giỏ hàng của user
        const findCart = await modelCart.findAll({ where: { userId: id } });

        // Validate thông tin giỏ hàng
        if (!findCart[0].address || !findCart[0].phone || !findCart[0].fullName) {
            throw new BadRequestError('Vui lòng nhập thông tin giỏ hàng');
        }

        // Tính tổng tiền
        const totalPrice = findCart.reduce((total, item) => total + item.totalPrice, 0);

        // Tạo mã thanh toán duy nhất cho đơn hàng
        const paymentId = generatePayID();

        // ===== PHƯƠNG THỨC 1: THANH TOÁN KHI NHẬN HÀNG (COD) =====
        if (typePayment === 'COD') {
            const dataCart = await modelCart.findAll({
                where: { userId: id },
            });

            // Tạo bản ghi thanh toán cho từng sản phẩm trong giỏ
            const paymentPromises = dataCart.map((cartItem) => {
                return modelPayments.create({
                    userId: id,
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    fullName: cartItem.fullName,
                    phone: cartItem.phone,
                    address: cartItem.address,
                    totalPrice: totalPrice,
                    status: 'pending',
                    typePayment: typePayment,
                    idPayment: paymentId,
                });
            });

            await Promise.all(paymentPromises);

            // Xóa giỏ hàng sau khi tạo đơn thành công
            await modelCart.destroy({ where: { userId: id } });

            return new OK({ message: 'Thanh toán thành công', metadata: paymentId }).send(res);
        }

        // ===== PHƯƠNG THỨC 2: THANH TOÁN QUA PAYPAL =====
        if (typePayment === 'PAYPAL') {
            try {
                // Tạo PayPal Order Request
                const request = new paypal.orders.OrdersCreateRequest();
                request.prefer('return=representation');
                request.requestBody({
                    intent: 'CAPTURE', // Capture payment ngay lập tức
                    purchase_units: [
                        {
                            amount: {
                                currency_code: 'USD',
                                // Chuyển đổi VND sang USD (tỷ giá mẫu: 1 USD = 24,000 VND)
                                // TODO: Nên sử dụng API tỷ giá thực tế cho production
                                value: (totalPrice / 24000).toFixed(2),
                            },
                            description: `Đơn hàng của ${findCart[0]?.fullName || 'khách hàng'}`,
                            // Lưu userId và paymentId để xử lý callback
                            custom_id: `${id}|${paymentId}`,
                        },
                    ],
                    application_context: {
                        brand_name: 'Computer Store',
                        landing_page: 'BILLING',
                        user_action: 'PAY_NOW',
                        // URL callback khi thanh toán thành công
                        return_url: paypalReturnUrl,
                        // URL khi user hủy thanh toán
                        cancel_url: paypalCancelUrl,
                    },
                });

                // Gọi PayPal API để tạo order
                const order = await paypalClient.client().execute(request);

                // Lấy URL để redirect user đến trang thanh toán PayPal
                const approvalUrl = order.result.links.find((link) => link.rel === 'approve').href;

                return new OK({
                    message: 'Đã tạo đơn hàng PayPal',
                    metadata: {
                        orderId: order.result.id,
                        approvalUrl: approvalUrl,
                        paymentId: paymentId,
                    },
                }).send(res);
            } catch (error) {
                console.error('💥 PayPal Order Creation Error:', error.message);
                throw new BadRequestError('Lỗi khi tạo đơn hàng PayPal: ' + error.message);
            }
        }

        // ===== PHƯƠNG THỨC 3: THANH TOÁN QUA VNPAY =====
        if (typePayment === 'VNPAY') {
            const vnpay = new VNPay({
                tmnCode: vnpTmnCode,
                secureSecret: vnpHashSecret,
                vnpayHost: vnpHost,
                testMode: vnpTestMode, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${findCart[0]?.userId} + ${paymentId}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `${findCart[0]?.userId} `,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: vnpReturnUrl, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });
            return new OK({ message: 'Thanh toán thông báo', metadata: vnpayResponse }).send(res);
        }

        // Nếu không match phương thức thanh toán nào
        throw new BadRequestError('Phương thức thanh toán không hợp lệ');
    }

    async checkPaymentPaypal(req, res, next) {
        try {
            console.log('🔔 ===== PayPal Callback Received =====');
            console.log('� Query params:', req.query);

            const { token, PayerID } = req.query;

            if (!token || !PayerID) {
                console.log('❌ Missing required params - token:', token, 'PayerID:', PayerID);
                return res.redirect(`${clientBaseUrl}/cart?payment=failed`);
            }

            console.log('✅ Token:', token);
            console.log('✅ PayerID:', PayerID);

            // Capture the order
            console.log('📤 Sending capture request to PayPal...');
            const request = new paypal.orders.OrdersCaptureRequest(token);
            request.requestBody({});

            const capture = await paypalClient.client().execute(request);
            console.log('✅ PayPal Capture Response Status:', capture.result.status);
            console.log('📦 Full capture result:', JSON.stringify(capture.result, null, 2));

            if (capture.result.status === 'COMPLETED') {
                // Lấy thông tin custom_id từ captures (PayPal trả về ở đây, không phải purchase_units trực tiếp)
                const customId = capture.result.purchase_units[0].payments.captures[0].custom_id;
                console.log('🔑 Custom ID:', customId);

                if (!customId) {
                    console.log('❌ No custom_id found in PayPal response');
                    console.log(
                        '📦 Purchase units structure:',
                        JSON.stringify(capture.result.purchase_units[0], null, 2),
                    );
                    return res.redirect(`${clientBaseUrl}/cart?payment=failed`);
                }

                const [userId, paymentId] = customId.split('|');
                console.log('👤 User ID:', userId);
                console.log('🆔 Payment ID:', paymentId);

                const findCart = await modelCart.findAll({ where: { userId: userId } });
                console.log('🛒 Cart items found:', findCart.length);

                if (findCart.length > 0) {
                    console.log('💾 Creating payment records...');
                    // Tạo payments trong database
                    const paymentPromises = findCart.map((item) => {
                        return modelPayments.create({
                            userId: item.userId,
                            productId: item.productId,
                            quantity: item.quantity,
                            fullName: item.fullName,
                            phone: item.phone,
                            address: item.address,
                            totalPrice: findCart.reduce((total, item) => total + item.totalPrice, 0),
                            status: 'pending',
                            typePayment: 'PAYPAL',
                            idPayment: paymentId,
                        });
                    });

                    await Promise.all(paymentPromises);
                    console.log('✅ Payment records created successfully');

                    // Xóa giỏ hàng sau khi thanh toán thành công
                    const deletedCount = await modelCart.destroy({ where: { userId: userId } });
                    console.log('🗑️ Cart cleared successfully - Deleted items:', deletedCount);

                    console.log('🎉 Redirecting to success page: /payment/' + paymentId);
                    return res.redirect(`${clientBaseUrl}/payment/${paymentId}`);
                } else {
                    console.log('⚠️ No cart items found for userId:', userId);
                    console.log('ℹ️ This might be normal if cart was already processed');
                    // Vẫn redirect về success vì thanh toán đã hoàn tất
                    return res.redirect(`${clientBaseUrl}/payment/${paymentId}`);
                }
            } else {
                console.log('❌ PayPal status not COMPLETED:', capture.result.status);
            }

            return res.redirect(`${clientBaseUrl}/cart?payment=failed`);
        } catch (error) {
            console.error('💥 ===== PayPal Capture Error =====');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            if (error.response) {
                console.error('PayPal API Response:', JSON.stringify(error.response, null, 2));
            }
            return res.redirect(`${clientBaseUrl}/cart?payment=failed`);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo.split(' ')[0];
            const paymentId = generatePayID();
            const findCart = await modelCart.findAll({ userId: idCart });
            findCart.map(async (item) => {
                return modelPayments.create({
                    userId: item.userId,
                    productId: item.productId,
                    quantity: item.quantity,
                    fullName: item.fullName,
                    phone: item.phone,
                    address: item.address,
                    totalPrice: findCart.reduce((total, item) => total + item.totalPrice, 0),
                    status: 'pending',
                    typePayment: 'VNPAY',
                    idPayment: paymentId,
                });
            });

            await modelCart.destroy({ where: { userId: idCart } });
            return res.redirect(`${clientBaseUrl}/payment/${paymentId}`);
        }
    }

    async getPayments(req, res) {
        const { id } = req.user;
        const payments = await modelPayments.findAll({ where: { userId: id }, order: [['createdAt', 'DESC']] });

        // Tạo map để gom nhóm theo idPayment
        const paymentGroups = new Map();

        // Gom nhóm payments theo idPayment
        for (const payment of payments) {
            const product = await modelProducts.findOne({ where: { id: payment.productId } });

            if (!paymentGroups.has(payment.idPayment)) {
                paymentGroups.set(payment.idPayment, {
                    orderId: payment.idPayment,
                    orderDate: payment.createdAt,
                    totalAmount: payment.totalPrice,
                    status: payment.status,
                    typePayment: payment.typePayment,
                    products: [],
                });
            }

            const group = paymentGroups.get(payment.idPayment);
            group.products.push({
                id: payment.id,
                quantity: payment.quantity,
                product: product,
                images: product.images,
            });
        }

        // Chuyển Map thành array để trả về
        const data = Array.from(paymentGroups.values());

        new OK({
            message: 'Get payments successfully',
            metadata: data,
        }).send(res);
    }

    async cancelOrder(req, res) {
        const { id } = req.user;
        const { orderId } = req.body;
        const payment = await modelPayments.findAll({ where: { userId: id, idPayment: orderId } });
        payment.map(async (item) => {
            item.status = 'cancelled';
            await item.save();
        });
        new OK({ message: 'Hủy đơn hàng thành công' }).send(res);
    }

    async getProductByIdPayment(req, res) {
        const { id } = req.user;
        const { idPayment } = req.query;
        console.log(idPayment);

        // Lấy thông tin payment bao gồm cả thông tin giao hàng
        const payments = await modelPayments.findAll({
            where: { userId: id, idPayment },
        });

        if (!payments.length) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }

        // Lấy thông tin chung của đơn hàng từ payment đầu tiên
        const orderInfo = {
            fullName: payments[0].fullName,
            phone: payments[0].phone,
            address: payments[0].address,
            typePayment: payments[0].typePayment,
            totalPrice: payments[0].totalPrice,
            status: payments[0].status,
            createdAt: payments[0].createdAt,
            products: [],
        };

        // Lấy thông tin chi tiết từng sản phẩm
        const productDetails = await Promise.all(
            payments.map(async (payment) => {
                const product = await modelProducts.findOne({
                    where: { id: payment.productId },
                });
                return {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: payment.quantity,
                    images: product.images,
                };
            }),
        );

        orderInfo.products = productDetails;

        new OK({
            message: 'Get order details successfully',
            metadata: orderInfo,
        }).send(res);
    }

    async getOrderAdmin(req, res) {
        try {
            // Lấy tất cả đơn hàng
            const orders = await modelPayments.findAll({
                order: [['createdAt', 'DESC']],
            });

            // Gom nhóm đơn hàng theo idPayment
            const groupedOrders = {};

            // Xử lý và gom nhóm đơn hàng
            for (const order of orders) {
                const orderData = order.get({ plain: true });
                const product = await modelProducts.findOne({
                    where: { id: orderData.productId },
                });

                if (!groupedOrders[orderData.idPayment]) {
                    const user = await modelUsers.findOne({
                        where: { id: orderData.userId },
                    });

                    groupedOrders[orderData.idPayment] = {
                        id: orderData.id,
                        idPayment: orderData.idPayment,
                        userId: orderData.userId,
                        fullName: orderData.fullName || user?.fullName,
                        phone: orderData.phone || user?.phone,
                        address: orderData.address || user?.address,
                        totalPrice: orderData.totalPrice,
                        status: orderData.status,
                        typePayment: orderData.typePayment,
                        createdAt: orderData.createdAt,
                        products: [],
                    };
                }

                if (product) {
                    groupedOrders[orderData.idPayment].products.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.images,
                        color: product.color,
                        size: product.size,
                        quantity: orderData.quantity,
                    });
                }
            }

            // Chuyển đổi object thành array để trả về
            const formattedOrders = Object.values(groupedOrders);

            new OK({
                message: 'Lấy danh sách đơn hàng thành công',
                metadata: formattedOrders,
            }).send(res);
        } catch (error) {
            console.error('Error in getOrderAdmin:', error);
            throw new BadRequestError('Lỗi khi lấy danh sách đơn hàng');
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { orderId, status } = req.body;

            // Kiểm tra trạng thái hợp lệ
            const validStatuses = ['pending', 'completed', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new BadRequestError('Trạng thái không hợp lệ');
            }

            // Cập nhật tất cả đơn hàng có cùng idPayment
            const order = await modelPayments.findOne({
                where: { id: orderId },
            });

            if (!order) {
                throw new BadRequestError('Không tìm thấy đơn hàng');
            }

            // Cập nhật trạng thái cho tất cả đơn hàng có cùng idPayment
            await modelPayments.update({ status }, { where: { idPayment: order.idPayment } });

            new OK({
                message: 'Cập nhật trạng thái đơn hàng thành công',
            }).send(res);
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            throw new BadRequestError('Lỗi khi cập nhật trạng thái đơn hàng');
        }
    }
}

module.exports = new PaymentsController();

