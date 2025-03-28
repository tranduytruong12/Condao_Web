import db from '../model/index.js';
import { createOrder, getOrderDetails, getAllOrders, getAllPayments, updatePaymentStatus, deletePayment } from '../Services/orderService.js';
import { processPayment } from '../Services/paymentService.js';

export const checkoutOrderController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {paymentMethod, recipientName, phoneNumber, addressLine1, city} = req.body;
        
        // Create shipping address
        const address = await db.Address.create({
            recipientName,
            phoneNumber,
            addressLine1,
            city,
            userId
        });

        // Create order
        const order = await createOrder(userId, address.id);
        
        // Process payment
        const paymentResult = await processPayment(order.id, paymentMethod, address.id, userId);

        let responseData = {
            orderId: order.id,
            totalAmount: order.totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: paymentResult.payment.status,
            shippingAddress: address
        };

        // Add QR data if payment method is VietQR
        if (paymentMethod === 'vietqr' && paymentResult.qrPayment) {  // Changed from qrData to qrPayment
            responseData.qrPayment = paymentResult.qrPayment;
        }

        return res.status(200).json({
            errorCode: 0,
            message: 'Đặt hàng thành công',
            data: responseData
        });

    } catch (error) {
        console.error("Error in checkout:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const getOrderDetailsController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const orderDetails = await getOrderDetails(orderId);

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy thông tin đơn hàng thành công',
            data: orderDetails
        });
    } catch (error) {
        return res.status(500).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const getAllOrdersController = async (req, res) => {
    try {
        console.log('Getting all orders...'); // Debug log
        const orders = await getAllOrders();
        console.log('Orders retrieved:', orders.length); // Debug log
        
        if (!orders) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Không tìm thấy đơn hàng nào'
            });
        }

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng'
        });
    }
};

export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Trạng thái đơn hàng không được để trống'
            });
        }

        const order = await db.Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        await order.update({ status });

        return res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: order
        });
    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng'
        });
    }
};

export const getAllPaymentsController = async (req, res) => {
    try {
        console.log('Getting all payments...'); // Debug log
        const payments = await getAllPayments();
        console.log('Payments retrieved:', payments.length); // Debug log
        
        if (!payments) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Không tìm thấy thanh toán nào'
            });
        }

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy danh sách thanh toán thành công',
            data: payments
        });
    } catch (error) {
        console.error("Error in getAllPayments:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Có lỗi xảy ra khi lấy danh sách thanh toán'
        });
    }
};

export const updatePaymentStatusController = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Trạng thái thanh toán không được để trống'
            });
        }

        const payment = await updatePaymentStatus(paymentId, status);

        return res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật trạng thái thanh toán thành công',
            data: payment
        });
    } catch (error) {
        console.error("Error in updatePaymentStatus:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái thanh toán'
        });
    }
};

export const deletePaymentController = async (req, res) => {
    try {
        const { paymentId } = req.params;
        await deletePayment(paymentId);

        return res.status(200).json({
            errorCode: 0,
            message: 'Xóa thanh toán thành công'
        });
    } catch (error) {
        console.error("Error in deletePayment:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Có lỗi xảy ra khi xóa thanh toán'
        });
    }
};