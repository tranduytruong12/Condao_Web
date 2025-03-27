import { vietQRConfig } from '../Config/vietqr.js';
import db from '../model/index.js';

export const generateVietQRController = async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        const userId = req.user.userId;

        // Tạo QR code cho thanh toán tạm thời (preview)
        const encodedAccountName = encodeURIComponent(vietQRConfig.accountName);
        const encodedDescription = encodeURIComponent(`thanh toan don hang ${orderId}`);
        
        const qrUrl = `https://img.vietqr.io/image/${vietQRConfig.bankId}-${vietQRConfig.accountNo}-${vietQRConfig.template}.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;

        return res.status(200).json({
            errorCode: 0,
            message: 'QR Code được tạo thành công',
            data: {
                qrUrl: qrUrl,
                amount: amount,
                bankInfo: {
                    bankId: vietQRConfig.bankId,
                    accountNo: vietQRConfig.accountNo,
                    accountName: vietQRConfig.accountName,
                    bankName: vietQRConfig.bankName
                }
            }
        });
    } catch (error) {
        console.error("Error generating QR:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const checkPaymentStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await db.Payment.findOne({
            where: { orderId: orderId }
        });

        if (!payment) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Không tìm thấy thông tin thanh toán'
            });
        }

        return res.status(200).json({
            errorCode: 0,
            data: {
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                amount: payment.amount,
                paymentDate: payment.paymentDate
            }
        });
    } catch (error) {
        return res.status(500).json({
            errorCode: 1,
            message: error.message
        });
    }
};