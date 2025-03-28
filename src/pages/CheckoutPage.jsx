import { Form, Input, Button, notification, Checkbox, Modal, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { checkoutOrderAPI, fetchAllCartAPI, generateVietQRAPI, getAccountAPI, updateOrderStatusAPI, clearCartAPI } from '../services/api.service';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import '../styles/CartPage.css';

const CheckoutPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [currentOrder, setCurrentOrder] = useState(null);
    const { setUser } = useContext(AuthContext);

    // Fetch cart total when component mounts
    useEffect(() => {
        const fetchCartTotal = async () => {
            try {
                const response = await fetchAllCartAPI();
                if (response.data && response.data.CartItems) {
                    const total = response.data.CartItems.reduce((sum, item) => 
                        sum + (item.Product.price * item.quantity), 0
                    );
                    setCartTotal(total);
                }
            } catch (error) {
                console.error("Failed to fetch cart total:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải thông tin giỏ hàng"
                });
            }
        };
        fetchCartTotal();
    }, []);

    const handlePayment = async (values) => {
        setLoading(true);
        try {
            const paymentMethod = values.paymentMethods[0];
            const addressData = {
                recipientName: values.recipientName,
                phoneNumber: values.phone,
                addressLine1: values.address,
                city: values.city,
                state: values.state || '',
                paymentMethod: paymentMethod
            };
    
            if (paymentMethod === 'vietqr') {
                // 1. Generate VietQR code first
                const vietQRResponse = await generateVietQRAPI(cartTotal);
                console.log("VietQR Response DETAILS:", JSON.stringify(vietQRResponse));

                if (vietQRResponse && vietQRResponse.data) {
                    let qrUrl = '';
                    
                    if (vietQRResponse.data.data && vietQRResponse.data.data.qrUrl) {
                        qrUrl = vietQRResponse.data.data.qrUrl;
                    } else if (vietQRResponse.data.qrUrl) {
                        qrUrl = vietQRResponse.data.qrUrl;
                    } else {
                        console.error("Không tìm thấy URL QR trong response:", vietQRResponse);
                        throw new Error("Không tìm thấy URL QR trong response");
                    }
                    
                    console.log("QR URL extracted:", qrUrl);
                    setQrCode(qrUrl);
                    setShowQRModal(true);
                } else {
                    throw new Error("QR code generation failed");
                }
            } else {
                // Handle COD payment
                const orderResponse = await checkoutOrderAPI(addressData);
                if (orderResponse && orderResponse.data) {
                    // Xóa giỏ hàng sau khi thanh toán thành công
                    await clearCartAPI();

                    notification.success({
                        message: "Đặt hàng thành công",
                        description: "Đơn hàng của bạn đã được xác nhận"
                    });
                    // Cập nhật trạng thái user để header cập nhật giỏ hàng
                    const userResponse = await getAccountAPI();
                    if (userResponse && userResponse.data) {
                        setUser(userResponse.data.user);
                    }
                    // Dispatch event để cập nhật giỏ hàng
                    window.dispatchEvent(new Event('cartUpdated'));
                    navigate('/');
                } else {
                    throw new Error("Invalid order response");
                }
            }
        } catch (error) {
            console.error("Payment Error:", error);
            notification.error({
                message: "Lỗi",
                description: error.message || "Đã có lỗi xảy ra khi thanh toán"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQRModalClose = async () => {
        setShowQRModal(false);
        try {
            // Tạo đơn hàng khi người dùng xác nhận đã thanh toán
            const formValues = form.getFieldsValue();
            const addressData = {
                recipientName: formValues.recipientName,
                phoneNumber: formValues.phone,
                addressLine1: formValues.address,
                city: formValues.city,
                state: formValues.state || '',
                paymentMethod: 'vietqr'
            };

            const orderResponse = await checkoutOrderAPI(addressData);

            if (orderResponse && orderResponse.data) {
                // Cập nhật trạng thái đơn hàng thành đã thanh toán
                const orderId = orderResponse.data.orderId || orderResponse.data.data.orderId;
                if (orderId) {
                    await updateOrderStatusAPI(orderId, 'paid');
                }

                // Xóa giỏ hàng sau khi thanh toán thành công
                await clearCartAPI();

                notification.success({
                    message: "Đặt hàng thành công",
                    description: "Đơn hàng của bạn đã được xác nhận"
                });
                // Cập nhật trạng thái user để header cập nhật giỏ hàng
                const userResponse = await getAccountAPI();
                if (userResponse && userResponse.data) {
                    setUser(userResponse.data.user);
                }
                // Dispatch event để cập nhật giỏ hàng
                window.dispatchEvent(new Event('cartUpdated'));
                navigate('/');
            } else {
                throw new Error("Invalid order response");
            }
        } catch (error) {
            console.error("Order Creation Error:", error);
            notification.error({
                message: "Lỗi",
                description: "Đã có lỗi xảy ra khi tạo đơn hàng"
            });
        }
    };

    return (
        <div className="cart-page">
            <h1>Thông tin giao hàng</h1>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2>Tổng tiền: {cartTotal.toLocaleString('vi-VN')}đ</h2>
            </div>
            
            <Form
                form={form}
                layout="vertical"
                onFinish={handlePayment}
                style={{ maxWidth: '600px', margin: '0 auto' }}
            >
                <Form.Item
                    label="Họ và tên người nhận"
                    name="recipientName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input placeholder="Nhập họ và tên người nhận" />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input.TextArea placeholder="Nhập địa chỉ giao hàng" rows={2} />
                </Form.Item>

                <Form.Item
                    label="Thành phố"
                    name="city"
                    rules={[{ required: true, message: 'Vui lòng nhập thành phố!' }]}
                >
                    <Input placeholder="Nhập thành phố" />
                </Form.Item>

                {/* <Form.Item
                    label="Quận/Huyện"
                    name="state"
                    rules={[{ required: true, message: 'Vui lòng nhập quận/huyện!' }]}
                >
                    <Input placeholder="Nhập quận/huyện" />
                </Form.Item> */}

                <Form.Item
                    label="Hình thức thanh toán"
                    name="paymentMethods"
                    rules={[{ required: true, message: 'Vui lòng chọn hình thức thanh toán!' }]}
                >
                    <Checkbox.Group>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Checkbox value="cod">Thanh toán khi nhận hàng (COD)</Checkbox>
                            {/* <Checkbox value="bank">Chuyển khoản ngân hàng</Checkbox> */}
                            <Checkbox value="vietqr">Thanh toán bằng QR Code</Checkbox>
                        </div>
                    </Checkbox.Group>
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Xác nhận đặt hàng
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="Quét mã QR để thanh toán"
                open={showQRModal}
                onCancel={handleQRModalClose}
                width={500}
                footer={[
                    <Button 
                        key="back" 
                        onClick={handleQRModalClose}
                    >
                        Hoàn tất
                    </Button>
                ]}
            >
                {qrCode ? (
                    <div style={{ textAlign: 'center' }}>
                        <img 
                            src={qrCode} 
                            alt="VietQR Code" 
                            style={{ 
                                maxWidth: '100%', 
                                marginBottom: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '8px' 
                            }} 
                            onError={(e) => {
                                console.error("QR Code image failed to load:", qrCode);
                                e.target.style.display = 'none';
                            }}
                        />
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f60' }}>
                                Số tiền: {cartTotal.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'left' 
                        }}>
                            <h3>Hướng dẫn thanh toán:</h3>
                            <ol style={{ paddingLeft: '20px' }}>
                                <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                                <li>Chọn chức năng "Quét QR"</li>
                                <li>Quét mã QR bên trên</li>
                                <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                            </ol>
                            <p style={{ marginTop: '10px', color: '#666' }}>
                                Lưu ý: Vui lòng không tắt cửa sổ này cho đến khi thanh toán hoàn tất
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <Spin /> <p>Đang tạo mã QR...</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CheckoutPage;