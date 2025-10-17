import { useEffect, useState } from 'react';
import { Table, Space, Button, message, Popconfirm, Modal, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './ManagerUser.module.scss';
import { requestGetUsers, requestUpdateRoleUser, requestDeleteUser } from '../../../../config/request';

const cx = classNames.bind(styles);

const ADMIN_POSITION_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'warehouse_manager', label: 'Quan ly kho' },
    { value: 'staff', label: 'Nhan vien' },
];

const ADMIN_POSITION_LABELS = {
    admin: 'Admin',
    warehouse_manager: 'Quan ly kho',
    staff: 'Nhan vien',
};

function ManagerUser() {
    const [users, setUsers] = useState([]);
    const [loading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        const res = await requestGetUsers();
        setUsers(res.metadata);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditUser = (user) => {
        setSelectedUser(user);
        form.setFieldsValue({
            userId: user.id,
            role: user.isAdmin,
            position: user.isAdmin === '1' ? user.position || 'admin' : undefined,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.submit();
    };

    const handleFinish = async (values) => {
        const payload = { ...values };
        if (payload.role !== '1') {
            payload.position = null;
        }
        await requestUpdateRoleUser(payload);
        await fetchUsers();
        message.success('Cap nhat quyen nguoi dung thanh cong');
        setIsModalVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Ho va ten',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'So dien thoai',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Dia chi',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Vai tro',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin) => (isAdmin === '1' ? 'Admin' : 'User'),
            filters: [
                { text: 'Admin', value: '1' },
                { text: 'User', value: '0' },
            ],
            onFilter: (value, record) => record.isAdmin === value,
        },
        {
            title: 'Chuc vu',
            dataIndex: 'position',
            key: 'position',
            render: (_, record) =>
                record.isAdmin === '1'
                    ? ADMIN_POSITION_LABELS[record.position] || 'Admin'
                    : 'Khong co',
            filters: ADMIN_POSITION_OPTIONS.map((option) => ({
                text: option.label,
                value: option.value,
            })),
            onFilter: (value, record) => (record.position || 'admin') === value,
        },
        {
            title: 'Thao tac',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                        className={cx('edit-btn')}
                    >
                        Sua quyen
                    </Button>
                    <Popconfirm
                        title="Xoa nguoi dung"
                        description="Ban co chac muon xoa nguoi dung nay?"
                        okText="Dong y"
                        cancelText="Huy"
                        onConfirm={() => handleDeleteUser(record.id)}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.isAdmin === '1'}
                        >
                            Xoa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Quản lý người dùng</h2>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} người dùng`,
                }}
            />

            <Modal
                title="Chỉnh sửa quyền người dùng"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Cập nhật"
                cancelText="Hủy"
                className={cx('permission-modal')}
            >
                {selectedUser && (
                    <div className={cx('user-info')}>
                        <p>
                            <strong>Họ và tên:</strong> {selectedUser.fullName}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedUser.email}
                        </p>
                    </div>
                )}
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="userId" hidden>
                        <input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Vai tro"
                        rules={[{ required: true, message: 'Vui long chon vai tro!' }]}
                    >
                        <Select>
                            <Select.Option value="0">User</Select.Option>
                            <Select.Option value="1">Admin</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
                        {({ getFieldValue }) =>
                            getFieldValue('role') === '1' ? (
                                <Form.Item
                                    name="position"
                                    label="Chuc vu"
                                    rules={[{ required: true, message: 'Vui long chon chuc vu!' }]}
                                >
                                    <Select>
                                        {ADMIN_POSITION_OPTIONS.map((option) => (
                                            <Select.Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ManagerUser;
