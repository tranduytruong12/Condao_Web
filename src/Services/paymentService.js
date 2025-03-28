import { vietQRConfig } from '../Config/vietqr.js';
import db from '../model/index.js';
import { generateVietQRCode } from './VietQRservice.js';

export const createVietQRUrl = async ({ amount, orderId }) => {
    try {
        // Tạo QR code
        const encodedAccountName = encodeURIComponent(vietQRConfig.accountName);
        const encodedDescription = encodeURIComponent(`thanh toan don hang ${orderId}`);
        
        const qrUrl = `https://img.vietqr.io/image/${vietQRConfig.bankId}-${vietQRConfig.accountNo}-${vietQRConfig.template}.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;

        // Lưu thông tin thanh toán
        await db.Payment.create({
            orderId: orderId,
            amount: amount,
            paymentMethod: 'vietqr',
            status: 'pending'
        });

        return {
            qrUrl: qrUrl
        };
    } catch (error) {
        throw error;
    }
};

export const processPayment = async (orderId, paymentMethod, addressId, userId) => {
    try {
        const order = await db.Order.findByPk(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        let paymentStatus = 'pending';
        let qrPayment = null;

        if (paymentMethod === 'cod') {
            paymentStatus = 'pending';
        } else if (paymentMethod === 'vietqr') {
            paymentStatus = 'processing';
            // Generate QR code for VietQR payment
            qrPayment = await generateVietQRCode({
                orderId: orderId,
                amount: order.totalAmount
            });
        }

        const payment = await db.Payment.create({
            userId: userId,
            orderId: orderId,
            addressId: addressId, 
            amount: order.totalAmount,
            paymentMethod: paymentMethod,
            status: paymentStatus
        });

        await order.update({ status: 'processing' });

        return {
            payment,
            qrPayment  // Return QR payment data
        };
    } catch (error) {
        throw error;
    }
};