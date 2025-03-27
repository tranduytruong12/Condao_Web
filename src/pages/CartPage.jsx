import { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/CartPage.css';
import { fetchAllCartAPI, deleteFromCartAPI, updateCartQuantityAPI } from '../services/api.service';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_BACKEND_URL; // Base URL for images

    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const res = await fetchAllCartAPI();
                if (res.data && Array.isArray(res.data.CartItems)) {
                    const items = res.data.CartItems.map(item => ({
                        id: item.id,
                        name: item.Product.name,
                        price: item.Product.price,
                        quantity: item.quantity,
                        image: item.Product.image.startsWith('http') ? item.Product.image : `${baseURL}/image/products/${item.Product.image}`
                    }));
                    setCartItems(items);
                    console.log(">>check cart items: ", items);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error("Failed to fetch cart items", error);
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadCartItems();
    }, []);

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            render: (text, record) => (
                <div className="cart-product">
                    <img src={record.image} alt={text} style={{ width: 80 }} />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            render: (price) => `${price.toLocaleString()}đ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(value) => updateQuantity(record.id, value)}
                />
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            render: (_, record) =>
                `${(record.price * record.quantity).toLocaleString()}đ`,
        },
        {
            title: 'action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(record.id)}
                />
            ),
        },
    ];

    const updateQuantity = async (id, quantity) => {
        if (!quantity) return;
        try {
            const res = await updateCartQuantityAPI(id, quantity);
            if (res.data) {
                const newItems = cartItems.map(item =>
                    item.id === id ? { ...item, quantity } : item
                );
                setCartItems(newItems);
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                message.error('Cập nhật số lượng sản phẩm thất bại');
            }
        } catch (error) {
            console.error("Failed to update product quantity", error);
            message.error('Cập nhật số lượng sản phẩm thất bại');
        }
    };

    const removeItem = async (id) => {
        try {
            const res = await deleteFromCartAPI(id);
            if (res.data) {
                const newItems = cartItems.filter(item => item.id !== id);
                setCartItems(newItems);
                window.dispatchEvent(new Event('cartUpdated'));
                message.success('Đã xóa sản phẩm khỏi giỏ hàng');
            } else {
                message.error('Xóa sản phẩm khỏi giỏ hàng thất bại');
            }
        } catch (error) {
            console.error("Failed to delete product from cart", error);
            message.error('Xóa sản phẩm khỏi giỏ hàng thất bại');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            message.error('Giỏ hàng trống!');
            return;
        }
        navigate('/checkout');
    };

    const total = cartItems.reduce((sum, item) =>
        sum + item.price * item.quantity, 0
    );

    if (loading) return <div className="center-spinner"><Spin size="large" /></div>;

    return (
        <div className="cart-page">
            <h1>Giỏ hàng</h1>
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Giỏ hàng trống</p>
                    <Button type="primary" onClick={() => navigate('/')}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={cartItems}
                        pagination={false}
                        rowKey={(record) => record.id}
                    />
                    <div className="cart-total">
                        <h2>Tổng cộng: {total.toLocaleString()}đ</h2>
                        <div className="action-buttons">
                            <Button onClick={() => navigate('/')} style={{ marginRight: 16 }}>
                                Tiếp tục mua sắm
                            </Button>
                            <Button type="primary" size="large" onClick={handleCheckout}>
                                Thanh toán
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
