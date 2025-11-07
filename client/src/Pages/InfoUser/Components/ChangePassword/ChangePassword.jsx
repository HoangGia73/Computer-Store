import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './ChangePassword.module.scss';
import { requestChangePassword } from '../../../../config/request';

const cx = classNames.bind(styles);

function ChangePassword() {
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            if (values.newPassword !== values.confirmPassword) {
                message.error('Mật khẩu xác nhận không khớp');
                return;
            }
            await requestChangePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            message.success('Đổi mật khẩu thành công');
            form.resetFields();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Đổi mật khẩu thất bại';
            message.error(msg);
        }
    };

    return (
        <Card title="Đổi mật khẩu" className={cx('card')}>
            <Form layout="vertical" form={form} onFinish={onFinish} className={cx('form')}>
                <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={["newPassword"]}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default ChangePassword;
