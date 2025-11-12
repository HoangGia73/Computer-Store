import classNames from 'classnames/bind';
import styles from './Index.module.scss';
import { Layout, Menu, theme } from 'antd';
import {
    HomeOutlined,
    ShoppingOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FileOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

import ManagerProduct from './Components/ManagerProducts/ManagerProduct';
import DashBoard from './Components/DashBoard/DashBoard';
import ManagerCategory from './Components/ManagerCategory/ManagerCategory';
import ManagerOrder from './Components/ManagerOrder/ManagerOrder';
import ManagerUser from './Components/ManagerUser/ManagerUser';
import { requestAdmin } from '../../config/request';
import { useNavigate } from 'react-router-dom';
import ManagerBlogs from './Components/ManagerBlogs/ManagerBlogs';
import ManagerContact from './Components/ManagerContact/ManagerContact';

const { Header, Sider, Content } = Layout;
const cx = classNames.bind(styles);

const MENU_CONFIG = [
    { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Quản lý sản phẩm' },
    { key: 'category', icon: <FileOutlined />, label: 'Quản lý danh mục' },
    { key: 'order', icon: <ShoppingOutlined />, label: 'Quản lý đơn hàng' },
    { key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
    { key: 'blogs', icon: <FileOutlined />, label: 'Quản lý tin tức' },
    { key: 'contact', icon: <FileOutlined />, label: 'Quản lý liên hệ' },
];

const getAccessibleKeys = (position) => {
    switch (position) {
        case 'warehouse_manager':
            return ['products'];
        case 'staff':
            return ['home', 'order', 'blogs', 'contact'];
        case 'admin':
        default:
            return MENU_CONFIG.map((item) => item.key);
    }
};

function Admin() {
    const [collapsed, setCollapsed] = useState(false);
    const { token } = theme.useToken();
    const [selectedKey, setSelectedKey] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminInfo = async () => {
            try {
                const adminInfo = await requestAdmin();
                const position = adminInfo?.position || 'admin';
                const accessibleKeys = getAccessibleKeys(position);
                const filteredMenu = MENU_CONFIG.filter((item) => accessibleKeys.includes(item.key));
                setMenuItems(filteredMenu);
                if (filteredMenu.length > 0) {
                    setSelectedKey(filteredMenu[0].key);
                } else {
                    setSelectedKey(null);
                }
            } catch (error) {
                navigate('/');
            }
        };

        fetchAdminInfo();
    }, [navigate]);

    useEffect(() => {
        if (!menuItems.length) {
            return;
        }
        if (!selectedKey || !menuItems.some((item) => item.key === selectedKey)) {
            setSelectedKey(menuItems[0].key);
        }
    }, [menuItems, selectedKey]);

    const renderViewByKey = (key) => {
        switch (key) {
            case 'products':
                return <ManagerProduct />;
            case 'home':
                return <DashBoard />;
            case 'category':
                return <ManagerCategory />;
            case 'order':
                return <ManagerOrder />;
            case 'users':
                return <ManagerUser />;
            case 'blogs':
                return <ManagerBlogs />;
            case 'contact':
                return <ManagerContact />;
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (!selectedKey) {
            return null;
        }
        if (!menuItems.some((item) => item.key === selectedKey)) {
            return null;
        }
        return renderViewByKey(selectedKey);
    };

    return (
        <Layout className={cx('wrapper')}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{
                    background: token.colorPrimary,
                }}
            >
                <div className={cx('logo')}>{collapsed ? 'A' : 'ADMIN'}</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKey ? [selectedKey] : []}
                    items={menuItems}
                    onClick={({ key }) => setSelectedKey(key)}
                    style={{
                        background: 'transparent',
                    }}
                />
            </Sider>
            <Layout>
                <Header className={cx('header')}>
                    <button
                        type="button"
                        style={{
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            fontSize: '16px',
                            color: token.colorTextSecondary,
                        }}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </button>
                </Header>
                <Content className={cx('content')}>{renderContent()}</Content>
            </Layout>
        </Layout>
    );
}

export default Admin;
