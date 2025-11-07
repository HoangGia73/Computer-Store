import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, ShoppingOutlined, HeartOutlined, HistoryOutlined, LogoutOutlined, KeyOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Index.module.scss';
import Header from '../../Components/Header/Header';

// Import c├íc components
import InfoUser from './Components/InfoUser/InfoUser';
import ChangePassword from './Components/ChangePassword/ChangePassword';
import ManagerOrder from './Components/ManagerOrder/ManagerOrder';
import ManagerProductWatch from './Components/ManagerProductWatch/ManagerProductWatch';
import { requestLogout } from '../../config/request';
import Footer from '../../Components/Footer/Footer';
// import Wishlist from './Components/Wishlist/Wishlist';
// import History from './Components/History/History';

const { Content, Sider } = Layout;
const cx = classNames.bind(styles);

function Index() {
    const navigate = useNavigate();
    const [currentComponent, setCurrentComponent] = useState(<InfoUser />);

    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === '/orders') {
            setCurrentComponent(<ManagerOrder />);
        }
    }, [pathname]);

    const handleMenuClick = (key, component) => {
        if (key === 'logout') {
            // Xß╗¡ l├╜ logout
            localStorage.removeItem('logged');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            navigate('/login');
            return;
        }
        setCurrentComponent(component);
    };

    const handleLogout = async () => {
        await requestLogout();
        localStorage.removeItem('logged');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        navigate('/');
    };

    const menuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => handleMenuClick('profile', <InfoUser />),
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
            onClick: () => handleMenuClick('orders', <ManagerOrder />),
        },
        {
            key: 'wishlist',
            icon: <HeartOutlined />,
            label: 'Sản phẩm yêu thích',
            onClick: () => handleMenuClick('wishlist', <ManagerProductWatch />),
        },
        {
            key: 'change-password',
            icon: <KeyOutlined />,
            label: 'Đổi mật khẩu',
            onClick: () => handleMenuClick('change-password', <ChangePassword />),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: () => handleLogout('logout'),
        },
    ];

    return (
        <Layout className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            <Layout>
                <Sider width={250} theme="light" className={cx('sider')}>
                    <Menu mode="inline" defaultSelectedKeys={['profile']} items={menuItems} className={cx('menu')} />
                </Sider>
                <Layout className={cx('content-layout')}>
                    <Content className={cx('content')}>{currentComponent}</Content>
                </Layout>
            </Layout>
            <footer>
                <Footer />
            </footer>
        </Layout>
    );
}

export default Index;
