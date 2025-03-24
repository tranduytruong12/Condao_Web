import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Spin, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/CartPage.css';
import { fetchAllCartAPI, deleteFromCartAPI, updateCartQuantityAPI } from '../services/api.service';
// Import QR code image from assets folder
import qrCodeImage from '../assets/images/qrcode/qrcode.jpg';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRCode, setShowQRCode] = useState(false);
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_BACKEND_URL; // Base URL for images

    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const res = await fetchAllCartAPI();
                if (res && res.data && res.data.CartItems && Array.isArray(res.data.CartItems)) {
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
            if (res && res.data) {
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
            if (res && res.data) {
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
        // Show QR code directly
        setShowQRCode(true);
    };

    // Add a new function to create an order and clear the cart
    const createOrderAndClearCart = async () => {
        try {
            // Set loading state
            setLoading(true);
            
            // Generate order ID for reference
            const orderId = Math.floor(100000 + Math.random() * 900000); // 6-digit number
            
            // Create an order object with necessary details
            const orderData = {
                orderId: orderId,
                items: cartItems,
                totalAmount: total,
                paymentMethod: 'bank',
                paymentStatus: 'pending',
                orderDate: new Date().toISOString(),
                bankInfo: {
                    bank: 'TECHCOMBANK',
                    accountNumber: '19036789888018',
                    accountName: 'CÔNG TY TNHH ABC'
                }
            };
            
            // You would typically send this to your backend API
            // For now we'll assume a successful API call
            
            // This would be your API call
            // const response = await createOrderAPI(orderData);
            
            // After successful order creation, clear the cart by deleting each item
            for (const item of cartItems) {
                await deleteFromCartAPI(item.id);
            }
            
            return { success: true, orderId };
        } catch (error) {
            console.error("Failed to create order or clear cart", error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const handleQRCodeContinue = async () => {
        // Show loading indicator
        message.loading({ content: 'Đang xử lý đơn hàng...', key: 'orderProcessing' });
        
        // Call function to create order and clear cart
        const result = await createOrderAndClearCart();
        
        if (result.success) {
            // Hide QR code modal
            setShowQRCode(false);
            
            // Show success message
            message.success({
                content: `Đơn hàng #${result.orderId} đã được xác nhận. Cảm ơn bạn đã mua hàng!`,
                key: 'orderProcessing',
                duration: 5
            });
            
            // Update cart items count in UI
            setCartItems([]);
            window.dispatchEvent(new Event('cartUpdated'));
            
            // Navigate to order confirmation page
            navigate('/', { 
                state: { 
                    paymentMethod: 'bank',
                    orderId: result.orderId,
                    orderCompleted: true
                } 
            });
        } else {
            // Show error message if the process failed
            message.error({
                content: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!',
                key: 'orderProcessing',
                duration: 3
            });
        }
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

                {/* QR Code Modal */}
                <Modal
                    title="Thanh toán chuyển khoản ngân hàng"
                    open={showQRCode}
                    onOk={handleQRCodeContinue}
                    onCancel={() => setShowQRCode(false)}
                    okText="Đã thanh toán"
                    cancelText="Hủy"
                    width={500}
                    confirmLoading={loading}
                >
                    <div className="qr-code-container" style={{ textAlign: 'center' }}>
                        <h3>Quét mã QR để thanh toán</h3>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                            Tổng tiền: {total.toLocaleString()}đ
                        </p>
                        <div style={{ margin: '20px auto', border: '1px solid #f0f0f0', padding: '15px', borderRadius: '4px', background: '#f9f9f9', width: '250px' }}>
                            <img 
                                src={qrCodeImage} 
                                alt="QR Code for bank transfer" 
                                style={{ width: '230px', height: '230px' }} 
                            />
                        </div>
                        <div style={{ textAlign: 'left', background: '#f6ffed', padding: '15px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Thông tin chuyển khoản:</p>
                            <p><strong>Ngân hàng:</strong> TECHCOMBANK</p>
                            <p><strong>Số tài khoản:</strong> 19036789888018</p>
                            <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH ABC</p>
                            <p><strong>Nội dung:</strong> <span style={{ backgroundColor: '#ffeb3b', padding: '2px 5px' }}>Thanh toan don hang #{Math.floor(100000 + Math.random() * 900000)}</span></p>
                        </div>
                        <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
                            Vui lòng quét mã QR hoặc chuyển khoản theo thông tin trên và nhấn "Đã thanh toán" sau khi hoàn tất.
                        </p>
                    </div>
                </Modal>
                </>
            )}
        </div>
    );
};

export default CartPage;