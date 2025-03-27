import { generateVietQRCode } from '../Services/VietQRservice';

const generateVietQRController = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        const qrData = await generateVietQRCode({
            orderId: orderId,
            amount: amount
        });

        return res.status(200).json({
            errorCode: 0,
            data: {
                qrUrl: qrData.qrUrl,
                amount: amount
            }
        });
    } catch (error) {
        return res.status(500).json({
            errorCode: -1,
            message: "Error generating VietQR code",
            error: error.message
        });
    }
};

export { generateVietQRController };