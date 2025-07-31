import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import Header from '../../Components/Header/Header';
import { Card, Table, Input, Form, Button, Checkbox, Space, message, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import {
    requestDeleteCart,
    requestPayment,
    requestUpdateInfoCart,
    requestUpdateQuantityCart,
} from '../../config/request';
import { useStore } from '../../hooks/useStore';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Cart() {
    const [checkBox, setCheckBox] = useState(false);
    const [localCartData, setLocalCartData] = useState([]);

    const { fetchCart, dataCart, dataUser } = useStore();

    const navigate = useNavigate();

    // Sync local cart data with global cart data
    useEffect(() => {
        setLocalCartData(dataCart);
    }, [dataCart]);

    const totalPrice = useMemo(() => {
        return localCartData.reduce((total, item) => total + item.totalPrice, 0);
    }, [localCartData]);

    const handleDeleteCart = async (id) => {
        try {
            const data = {
                cartId: id,
            };
            await requestDeleteCart(data);
            fetchCart();
            message.success('Xoá sản phẩm trong giỏ hàng thành công');
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const handleChangeQuantity = async (record, newQuantity) => {
        try {
            if (newQuantity <= 0) {
                message.error('Số lượng phải lớn hơn 0');
                return;
            }

            if (newQuantity > record.product.stock) {
                message.error('Số lượng sản phẩm không được vượt quá số lượng có trong kho');
                return;
            }

            // Update local state immediately for instant UI feedback
            const updatedLocalData = localCartData.map((item) => {
                if (item.id === record.id) {
                    const finalPrice =
                        !record.product.isComponent && record.product.discount > 0
                            ? record.product.price * (1 - record.product.discount / 100)
                            : record.product.price;
                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: finalPrice * newQuantity,
                    };
                }
                return item;
            });
            setLocalCartData(updatedLocalData);

            const data = {
                productId: record.product.id,
                quantity: newQuantity,
            };

            await requestUpdateQuantityCart(data);
            // Cập nhật lại dữ liệu giỏ hàng từ server
            await fetchCart();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            // Reset local data to server data if error occurs
            setLocalCartData(dataCart);
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            key: 'name',
            render: (text, record) => (
                <Space>
                    <img
                        src={record.product.images.split(',')[0]}
                        alt={text}
                        style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: ['product', 'price'],
            key: 'price',
            render: (price) => `${price?.toLocaleString()} đ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <InputNumber
                    value={localCartData.find((item) => item.id === record.id)?.quantity || quantity}
                    onChange={(value) => handleChangeQuantity(record, value)}
                    style={{ width: 80 }}
                    min={1}
                    max={record.product.stock}
                    precision={0}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'total',
            render: (totalPrice, record) => {
                const currentItem = localCartData.find((item) => item.id === record.id);
                const displayPrice = currentItem ? currentItem.totalPrice : totalPrice;
                return `${displayPrice?.toLocaleString()} đ`;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (record) => (
                <Button
                    onClick={() => handleDeleteCart(record.id)}
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ fontSize: '16px' }}
                />
            ),
        },
    ];

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (dataUser) {
            setFullName(dataUser.fullName);
            setPhone(dataUser.phone);
            setAddress(dataUser.address);
        }
    }, [dataUser]);

    useEffect(() => {
        const fetchData = async () => {
            const data = {
                fullName,
                phone,
                address,
            };

            await requestUpdateInfoCart(data);
        };
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fullName, phone, address]);

    const handlePayment = async (typePayment) => {
        if (!checkBox) {
            message.error('Bạn phải đồng ý với các Điều kiện giao dịch chung của website');
            return;
        }
        if (!fullName || !phone || !address) {
            message.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        try {
            const data = {
                typePayment,
            };
            if (typePayment === 'COD') {
                const res = await requestPayment(data);
                message.success('Đặt hàng thành công');
                await fetchCart();
                navigate(`/payment/${res.metadata}`);
            }
            if (typePayment === 'MOMO') {
                const res = await requestPayment(data);
                window.open(res.metadata.payUrl, '_blank');
            }
            if (typePayment === 'VNPAY') {
                const res = await requestPayment(data);
                window.open(res.metadata, '_blank');
            }
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('container')}>
                    <Table dataSource={localCartData} columns={columns} pagination={false} />
                    {localCartData.length > 0 && (
                        <div className={cx('checkout-section')}>
                            <Card title="THÔNG TIN NGƯỜI MUA" style={{ marginBottom: 16 }}>
                                <Form layout="vertical">
                                    <Form.Item label="Họ tên" required>
                                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                    </Form.Item>
                                    <Form.Item
                                        label="SĐT"
                                        required
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                pattern: /^0\d{0,9}$/,
                                                message: 'SĐT phải bắt đầu bằng số 0 và tối đa 10 số',
                                            },
                                            {
                                                required: true,
                                                message: 'SĐT không được để trống',
                                            },
                                        ]}
                                    >
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            maxLength={10}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Địa chỉ" required>
                                        <Input.TextArea value={address} onChange={(e) => setAddress(e.target.value)} />
                                    </Form.Item>
                                    <Form.Item label="Ghi chú">
                                        <Input.TextArea />
                                    </Form.Item>
                                </Form>
                            </Card>

                            <Card title="TỔNG TIỀN">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div className={cx('total-section')}>
                                        <p>Tổng cộng: {totalPrice.toLocaleString()} đ</p>
                                        <p>Giảm giá Voucher: 0 đ</p>
                                        <p>Thành tiền: {totalPrice.toLocaleString()} đ</p>
                                        <p>(Giá đã bao gồm VAT)</p>
                                    </div>

                                    <Checkbox onChange={(e) => setCheckBox(e.target.checked)}>
                                        Tôi đã đọc và đồng ý với các Điều kiện giao dịch chung của website
                                    </Checkbox>

                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button
                                            onClick={() => handlePayment('COD')}
                                            type="primary"
                                            block
                                            disabled={!checkBox}
                                        >
                                            Thanh toán khi nhận hàng
                                        </Button>
                                        <Button
                                            onClick={() => handlePayment('MOMO')}
                                            type="default"
                                            block
                                            disabled={!checkBox}
                                        >
                                            Thanh toán qua MOMO
                                        </Button>
                                        <Button
                                            onClick={() => handlePayment('VNPAY')}
                                            type="primary"
                                            block
                                            disabled={!checkBox}
                                        >
                                            Thanh toán qua VNPAY
                                        </Button>
                                    </Space>
                                </Space>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Cart;
