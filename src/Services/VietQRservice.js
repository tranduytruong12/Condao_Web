import { vietQRConfig } from '../Config/vietqr.js';

export const generateVietQRCode = async ({ orderId, amount }) => {
    try {
        const encodedAccountName = encodeURIComponent(vietQRConfig.accountName);
        const encodedDescription = encodeURIComponent(`thanh toan don hang ${orderId}`);
        
        const qrUrl = `https://img.vietqr.io/image/${vietQRConfig.bankId}-${vietQRConfig.accountNo}-${vietQRConfig.template}.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;

        return {
            qrUrl: qrUrl,
            amount: amount,
            bankInfo: {
                bankId: vietQRConfig.bankId,
                accountNo: vietQRConfig.accountNo,
                accountName: vietQRConfig.accountName,
                bankName: vietQRConfig.bankName
            },
            transferContent: `thanh toan don hang ${orderId}'}`
        };
    } catch (error) {
        throw new Error('Failed to generate VietQR code: ' + error.message);
    }
};