import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Tag, List, Avatar, Typography, Descriptions, Space, Divider, Row, Col } from 'antd';
import { fetchOrdersAPI, updateOrderStatusAPI } from '../../services/api.service';

const { Text, Title } = Typography;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetchOrdersAPI();
            setOrders(response.data.data);
            console.log('Danh sách đơn hàng:', response.data.data);
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleConfirmOrder = async (orderId) => {
        try {
            message.loading('Đang cập nhật đơn hàng...', 1);
            await updateOrderStatusAPI(orderId, 'confirmed');
            message.success('Đã xác nhận đơn hàng thành công');
            fetchOrders(); // Refresh danh sách đơn hàng
        } catch (error) {
            message.error('Không thể xác nhận đơn hàng: ' + (error.response?.data?.message || error.message));
            console.error('Confirm order error:', error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            message.loading('Đang cập nhật đơn hàng...', 1);
            await updateOrderStatusAPI(orderId, 'cancelled');
            message.success('Đã hủy đơn hàng thành công');
            fetchOrders(); // Refresh danh sách đơn hàng
        } catch (error) {
            message.error('Không thể hủy đơn hàng');
            console.error('Cancel order error:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'gold';
            case 'confirmed':
                return 'green';
            case 'cancelled':
                return 'red';
            case 'delivered':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'ĐANG CHỜ';
            case 'confirmed':
                return 'ĐÃ XÁC NHẬN';
            case 'cancelled':
                return 'ĐÃ HỦY';
            case 'delivered':
                return 'ĐÃ GIAO';
            default:
                return status.toUpperCase();
        }
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'User',
            key: 'user',
            render: (user) => user?.name || 'Không có thông tin',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString('vi-VN'),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount),
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Đang chờ', value: 'pending' },
                { text: 'Đã xác nhận', value: 'confirmed' },
                { text: 'Đã hủy', value: 'cancelled' },
                { text: 'Đã giao', value: 'delivered' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedOrder(record);
                            setIsModalVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                onClick={() => handleConfirmOrder(record.id)}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                type="primary" 
                                danger
                                onClick={() => handleCancelOrder(record.id)}
                            >
                                Hủy
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="order-management">
            <div style={{ marginBottom: 20 }}>
                <Title level={2}>Quản lý đơn hàng</Title>
            </div>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        <Title level={4}>Chi tiết đơn hàng</Title>
                        {selectedOrder && (
                            <Tag color={getStatusColor(selectedOrder.status)} style={{ marginLeft: 8 }}>
                                {getStatusText(selectedOrder.status)}
                            </Tag>
                        )}
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã đơn hàng" span={2}>{selectedOrder.id}</Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{selectedOrder.User?.name || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.User?.email || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(selectedOrder.totalAmount)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Danh sách sản phẩm</Divider>
                        
                        <List
                            itemLayout="horizontal"
                            dataSource={selectedOrder.OrderItems || []}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.Product?.image} shape="square" size={64} />}
                                        title={item.Product?.name}
                                        description={
                                            <Space direction="vertical">
                                                <Text>Giá: {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(item.price)}</Text>
                                                <Text>Số lượng: {item.quantity}</Text>
                                            </Space>
                                        }
                                    />
                                    <div>
                                        <Text strong>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(item.price * item.quantity)}
                                        </Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                        
                        {selectedOrder.status === 'pending' && (
                            <Row justify="end" style={{ marginTop: 24 }}>
                                <Col>
                                    <Space>
                                        <Button 
                                            type="primary" 
                                            danger
                                            onClick={() => {
                                                handleCancelOrder(selectedOrder.id);
                                                setIsModalVisible(false);
                                            }}
                                        >
                                            Hủy đơn hàng
                                        </Button>
                                        <Button 
                                            type="primary"
                                            onClick={() => {
                                                handleConfirmOrder(selectedOrder.id);
                                                setIsModalVisible(false);
                                            }}
                                        >
                                            Xác nhận đơn hàng
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement; 