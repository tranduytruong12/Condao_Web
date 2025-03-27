import db from '../model/index.js';
import { createOrder } from '../Services/orderService.js';
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