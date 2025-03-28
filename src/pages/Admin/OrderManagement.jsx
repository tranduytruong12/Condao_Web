import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Tag, Typography, Descriptions, Space, Divider, Row, Col, Dropdown, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { fetchPaymentsAPI, updatePaymentStatusAPI, deletePaymentAPI } from '../../services/api.service';

const { Text, Title } = Typography;

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await fetchPaymentsAPI();
            console.log('API Response:', response);
            if (response && response.data) {
                console.log('Payments data:', response.data);
                setPayments(response.data);
            } else {
                console.log('Invalid response format:', response);
                message.error('Không thể tải danh sách thanh toán');
                setPayments([]);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            message.error('Có lỗi xảy ra khi tải danh sách thanh toán');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleUpdateStatus = async (paymentId, newStatus) => {
        try {
            message.loading('Đang cập nhật trạng thái thanh toán...', 1);
            const res = await updatePaymentStatusAPI(paymentId, newStatus);
            if (res && res.data) {
                message.success(`Đã cập nhật trạng thái thanh toán thành ${getStatusText(newStatus)}`);
                fetchPayments(); // Refresh danh sách thanh toán
            } else {
                message.error('Không thể cập nhật trạng thái thanh toán');
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái thanh toán: ' + (error.response?.data?.message || error.message));
            console.error('Update status error:', error);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        try {
            message.loading('Đang xóa thanh toán...', 1);
            const res = await deletePaymentAPI(paymentId);
            if (res && res.data) {
                message.success('Đã xóa thanh toán thành công');
                fetchPayments(); // Refresh danh sách thanh toán
            } else {
                message.error('Không thể xóa thanh toán');
            }
        } catch (error) {
            message.error('Không thể xóa thanh toán: ' + (error.response?.data?.message || error.message));
            console.error('Delete payment error:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'gold';
            case 'processing':
                return 'orange';
            case 'completed':
                return 'green';
            case 'failed':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'ĐANG CHỜ';
            case 'processing':
                return 'ĐANG XỬ LÝ';
            case 'completed':
                return 'ĐÃ HOÀN THÀNH';
            case 'failed':
                return 'THẤT BẠI';
            default:
                return status.toUpperCase();
        }
    };

    const getStatusMenu = (paymentId) => ({
        items: [
            {
                key: 'processing',
                label: 'Chuyển sang xử lý',
                onClick: () => handleUpdateStatus(paymentId, 'processing')
            },
            {
                key: 'completed',
                label: 'Đánh dấu hoàn thành',
                onClick: () => handleUpdateStatus(paymentId, 'completed')
            },
            {
                key: 'failed',
                label: 'Đánh dấu thất bại',
                danger: true,
                onClick: () => handleUpdateStatus(paymentId, 'failed')
            }
        ]
    });

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cod':
                return 'Thanh toán khi nhận hàng (COD)';
            case 'vietqr':
                return 'Thanh toán qua QR Code';
            default:
                return method?.toUpperCase() || 'Không có thông tin';
        }
    };

    const columns = [
        {
            title: 'Mã thanh toán',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'User',
            key: 'user',
            render: (user) => user?.username || 'Không có thông tin',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString('vi-VN'),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => getPaymentMethodText(method),
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
                { text: 'Đang xử lý', value: 'processing' },
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Thất bại', value: 'failed' },
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
                            setSelectedPayment(record);
                            setIsModalVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.status !== 'completed' && record.status !== 'failed' && (
                        <Dropdown menu={getStatusMenu(record.id)} placement="bottomRight">
                            <Button type="primary">
                                Thao tác
                            </Button>
                        </Dropdown>
                    )}
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa thanh toán này?"
                        onConfirm={() => handleDeletePayment(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="payment-management">
            <div style={{ marginBottom: 20 }}>
                <Title level={2}>Quản lý thanh toán</Title>
            </div>
            <Table
                columns={columns}
                dataSource={payments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        <Title level={4}>Chi tiết thanh toán</Title>
                        {selectedPayment && (
                            <Tag color={getStatusColor(selectedPayment.status)} style={{ marginLeft: 8 }}>
                                {getStatusText(selectedPayment.status)}
                            </Tag>
                        )}
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedPayment && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã thanh toán" span={2}>{selectedPayment.id}</Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{selectedPayment.User?.username || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedPayment.User?.email || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(selectedPayment.amount)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {getPaymentMethodText(selectedPayment.paymentMethod)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người nhận">{selectedPayment.Address?.recipientName || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedPayment.Address?.phoneNumber || 'Không có thông tin'}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {selectedPayment.Address?.addressLine1 || 'Không có thông tin'}
                                {selectedPayment.Address?.addressLine2 && `, ${selectedPayment.Address.addressLine2}`}
                                {selectedPayment.Address?.city && `, ${selectedPayment.Address.city}`}
                                {selectedPayment.Address?.state && `, ${selectedPayment.Address.state}`}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Danh sách sản phẩm</Divider>
                        <Table
                            dataSource={selectedPayment.Order?.OrderItems || []}
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: ['Product', 'name'],
                                    key: 'name',
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'center',
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: ['Product', 'price'],
                                    key: 'price',
                                    render: (price) => new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(price),
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'total',
                                    render: (_, record) => new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(record.quantity * record.Product.price),
                                }
                            ]}
                            pagination={false}
                            rowKey={(record) => `${record.Product.id}-${record.quantity}`}
                        />
                        
                        {selectedPayment.status !== 'completed' && selectedPayment.status !== 'failed' && (
                            <Row justify="end" style={{ marginTop: 24 }}>
                                <Col>
                                    <Space>
                                        <Dropdown menu={getStatusMenu(selectedPayment.id)} placement="topRight">
                                            <Button type="primary">
                                                Cập nhật trạng thái
                                            </Button>
                                        </Dropdown>
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

export default PaymentManagement; 