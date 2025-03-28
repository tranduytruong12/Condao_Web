import { Link, useNavigate } from 'react-router-dom';
import { Menu, Badge, Dropdown, Input, Button } from 'antd'; // Import Input and Button from antd
import { UsergroupAddOutlined, HomeOutlined, AuditOutlined, LoginOutlined, AliwangwangOutlined, ShoppingCartOutlined, SearchOutlined, PayCircleOutlined } from '@ant-design/icons'; // Import SearchOutlined
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/auth.context';
import { fetchAllCartAPI } from '../../../services/api.service';
import '../../../styles/Header.css';

const Header = ({ current, setCurrent }) => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Add state for search query

    useEffect(() => {
        if (user?.userId) {
            fetchCartItems();
        }
    }, [user?.userId]);

    const fetchCartItems = async () => {
        try {
            const res = await fetchAllCartAPI();
            if (res.data && Array.isArray(res.data.CartItems)) {
                const items = res.data.CartItems.map(item => ({
                    id: item.id,
                    title: item.Product.name,
                    price: item.Product.price,
                    quantity: item.quantity,
                    image: item.Product.image.startsWith('http')
                        ? item.Product.image
                        : `${import.meta.env.VITE_BACKEND_URL}/image/products/${item.Product.image}`
                }));
                setCartItems(items);
                setCartItemCount(res.data.CartItems.length);
            } else {
                // Nếu không có sản phẩm trong giỏ hàng, reset state
                setCartItems([]);
                setCartItemCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch cart items", error);
            // Nếu có lỗi, reset state
            setCartItems([]);
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartItems();
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = () => {
        setUser({
            id: "",
            email: "",
            username: "",
            roles: []
        });
        localStorage.removeItem("token");
        setCartItems([]);
        setCartItemCount(0);
        navigate('/');
        setCurrent('home');
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        navigate(`/search?query=${value}`);
    };

    const isAdmin = user?.roles?.includes('Admin');

    const cartMenu = {
        items: [
            {
                key: 'cart-content',
                label: (
                    <div style={{ padding: '12px', width: '300px' }}>
                        {cartItems.length > 0 ? (
                            <>
                                {cartItems.map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '8px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                            <div style={{ color: '#666' }}>
                                                {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '8px' }}>x{item.quantity}</div>
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                    <Link to="/cart">
                                        <Button type="primary">View Cart</Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>Your cart is empty</div>
                        )}
                    </div>
                )
            }
        ]
    };

    const items = [
        {
            label: <Link to={"/"}>Home</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        ...(isAdmin ? [
            {
                label: <Link to={"/admin/users"}>Users</Link>,
                key: 'users',
                icon: <UsergroupAddOutlined />
            },
            {
                label: <Link to={"/admin/products"}>Products</Link>,
                key: 'products',
                icon: <AuditOutlined />,
            },
            {
                label: <Link to={"/admin/payments"}>Quản lý thanh toán</Link>,
                key: 'payments',
                icon: <PayCircleOutlined />,
            },
        ] : []),
        {
            label: (
                <Dropdown menu={cartMenu} trigger={['hover']}>
                    <Link to={"/cart"}>
                        <span className="cart-icon">Giỏ hàng</span>
                    </Link>
                </Dropdown>
            ),
            key: 'cart',
            icon: <Badge count={cartItemCount} size="small">
                <ShoppingCartOutlined className="cart-icon" />
            </Badge>,
        },
        ...(!user.userId ? [{
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),
        ...(user.userId ? [{
            label: `Welcome ${user.username}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: 'Đăng xuất',
                    key: 'logout',
                    onClick: handleLogout,
                },
            ],
        }] : []),
    ];

    useEffect(() => {
        // Set active menu item based on current path
        const path = location.pathname;
        if (path === '/') {
            setCurrent('home');
        } else if (path === '/cart') {
            setCurrent('cart');
        } else if (path === '/admin/users') {
            setCurrent('users');
        } else if (path === '/admin/products') {
            setCurrent('products');
        } else if (path === '/admin/payments') {
            setCurrent('payments');
        }
    }, [location]);

    return (
        <div className="header">
            <div className="logo">
                <Link to="/">
                    <img src="/src/assets/images/slides/Logodemo.png" alt="Logo" />
                </Link>
            </div>
            <Menu
                mode="horizontal"
                selectedKeys={[current]}
                onClick={onClick}
                items={items}
                className="menu"
            />
            <div className="search">
                <Input.Search
                    placeholder="Search products..."
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
            </div>
        </div>
    );
};

export default Header;