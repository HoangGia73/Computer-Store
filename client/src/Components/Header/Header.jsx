import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { useEffect, useState } from 'react';

import { requestGetCategory, requestGetProductSearch, requestLogout } from '../../config/request';

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Avatar, Dropdown } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    LogoutOutlined,
    WindowsOutlined,
    SearchOutlined,
    DownOutlined,
} from '@ant-design/icons';

import useDebounce from '../../hooks/useDebounce';

const cx = classNames.bind(styles);

function Header() {
    const createMatchMediaState = () => (typeof window !== 'undefined' ? window.innerWidth > 768 : false);
    const [category, setCategory] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(createMatchMediaState);
    const [isDesktop, setIsDesktop] = useState(createMatchMediaState);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetCategory();
            setCategory(res);
        };
        fetchData();
    }, []);

    const { dataUser, dataCart } = useStore();

    const Navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth > 768;
            setIsDesktop(desktop);
            if (desktop) {
                setIsMenuOpen(true);
            } else {
                setIsMenuOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isDesktop) {
            setIsMenuOpen(false);
        }
    }, [location.pathname, isDesktop]);

    const items = [
        {
            key: '1',
            label: <Link to="/profile">Thông tin tài khoản</Link>,
            icon: <UserOutlined />,
        },
        {
            key: '2',
            label: <Link to="/orders">Đơn hàng của tôi</Link>,
            icon: <ShoppingOutlined />,
        },
        {
            key: '3',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: async () => {
                await requestLogout();
                localStorage.removeItem('logged');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                Navigate('/');
            },
        },
    ];

    const [selectedCategory, setSelectedCategory] = useState('all');

    const [search, setSearch] = useState('');

    const debounceSearch = useDebounce(search, 500);
    const [productSearch, setProductSearch] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetProductSearch({ search: debounceSearch });
            setProductSearch(res.metadata);
        };
        if (debounceSearch) {
            fetchData();
        }
    }, [debounceSearch]);

    const handleNavigate = () => {
        if (search.trim() !== '') {
            Navigate(`/search/${selectedCategory}/${encodeURIComponent(search)}`);
            setSearch('');
            setProductSearch([]);
        } else {
            Navigate(`/category/${selectedCategory}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && search.trim() !== '') {
            handleNavigate();
        }
    };

    const handleSearchItemClick = (itemId) => {
        Navigate(`/products/${itemId}`);
        setSearch('');
        setProductSearch([]);
    };

    const renderCategoryLinks = () =>
        category.map((item) => (
            <Link
                key={item.id}
                to={`/category/${item.id}`}
                onClick={() => {
                    if (!isDesktop) {
                        setIsMenuOpen(false);
                    }
                }}
            >
                <div className={cx('category-item')}>
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                </div>
            </Link>
        ));

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('inner-top')}>
                    <Link to="/" className={cx('logo')}>
                        <img src="https://pcmarket.vn/static/assets/2021/images/logo-new.png" alt="PC Market Logo" />
                    </Link>
                    {!isDesktop && (
                        <div className={cx('mobile-actions')}>
                            <Link to="/cart" className={cx('mobile-icon')}>
                                <ShoppingOutlined style={{ fontSize: '20px' }} />
                                {dataCart.length > 0 && (
                                    <span className={cx('badge')}>
                                        {dataCart.length > 99 ? '99+' : dataCart.length}
                                    </span>
                                )}
                            </Link>
                            {dataUser.id ? (
                                <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                    <div className={cx('mobile-icon', 'user-icon')}>
                                        {dataUser.avatar ? (
                                            <Avatar src={dataUser.avatar} size={36} />
                                        ) : (
                                            <Avatar
                                                size={36}
                                                icon={<UserOutlined />}
                                                style={{
                                                    backgroundColor: '#87d068',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            />
                                        )}
                                    </div>
                                </Dropdown>
                            ) : (
                                <Link to="/login" className={cx('mobile-icon', 'user-icon')}>
                                    <UserOutlined style={{ fontSize: '20px' }} />
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {!isDesktop && (
                    <div className={cx('mobile-quick-links')}>
                        <Link to="/contact" className={cx('quick-link')}>
                            <WindowsOutlined />
                            <span>Tư vấn build PC</span>
                        </Link>
                        <Link to="/buildpc" className={cx('quick-link')}>
                            <WindowsOutlined />
                            <span>Xây dựng cấu hình</span>
                        </Link>
                    </div>
                )}

                <div className={cx('search-container')}>
                    <select name="category" id="category" onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="all">Tất cả danh mục</option>
                        {category.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            setTimeout(() => {
                                setProductSearch([]);
                            }, 200);
                        }}
                    />
                    <button onClick={handleNavigate}>
                        <SearchOutlined />
                    </button>
                    {debounceSearch && productSearch.length > 0 && (
                        <div className={cx('search-result')}>
                            <ul style={{ width: '100%' }}>
                                {productSearch.length === 0 ? (
                                    <li>Không tìm thấy sản phẩm</li>
                                ) : (
                                    productSearch.map((item) => (
                                        <li key={item.id} onClick={() => handleSearchItemClick(item.id)}>
                                            <img src={item.images.split(',')[0]} alt={item.name} />
                                            <div>
                                                <h3>{item.name}</h3>
                                                <p>
                                                    {(item.discount
                                                        ? item.price - (item.price * item.discount) / 100
                                                        : item.price
                                                    ).toLocaleString('vi-VN')}{' '}
                                                    VNĐ
                                                </p>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                {isDesktop &&
                    (!dataUser.id ? (
                        <div className={cx('auth-buttons')}>
                            <Link to="/login">
                                <button>Đăng nhập</button>
                            </Link>
                            <Link to="/register">
                                <button>Đăng ký</button>
                            </Link>
                        </div>
                    ) : (
                        <div className={cx('user-menu')}>
                            <div>
                                <Link to="/contact" className={cx('cart-button')}>
                                    <WindowsOutlined style={{ fontSize: '24px' }} />
                                    Tư vấn build PC
                                </Link>
                            </div>
                            <div className={cx('cart-menu')}>
                                <Link to="/buildpc" className={cx('cart-button')}>
                                    <WindowsOutlined style={{ fontSize: '24px' }} />
                                    Xây dựng cấu hình
                                </Link>

                                <Link to="/cart" className={cx('cart-button')}>
                                    <ShoppingOutlined style={{ fontSize: '24px' }} />
                                    Giỏ hàng ({dataCart.length})
                                </Link>
                            </div>
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <div className={cx('user-avatar')}>
                                    {dataUser.avatar ? (
                                        <Avatar src={dataUser.avatar} size={40} />
                                    ) : (
                                        <Avatar
                                            size={40}
                                            icon={<UserOutlined />}
                                            style={{
                                                backgroundColor: '#87d068',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        />
                                    )}
                                    <span>{dataUser.fullName || 'Người dùng'}</span>
                                </div>
                            </Dropdown>
                        </div>
                    ))}
            </div>
            {isDesktop ? (
                <div className={cx('category-list', 'desktop')}>{renderCategoryLinks()}</div>
            ) : (
                <div className={cx('category-bar')}>
                    <button
                        type="button"
                        className={cx('category-toggle')}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-expanded={isMenuOpen}
                        aria-controls="header-category-menu"
                    >
                        <span>Danh muc san pham</span>
                        <DownOutlined className={cx('category-toggle-icon', { open: isMenuOpen })} />
                    </button>
                    <div id="header-category-menu" className={cx('category-list', { open: isMenuOpen })}>
                        {renderCategoryLinks()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Header;
