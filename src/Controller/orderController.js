import db from '../model/index.js';
import { createOrder, getOrderDetails } from '../Services/orderService.js';
import { generateVietQRCode } from '../Services/VietQRservice.js';
import { processPayment } from '../Services/paymentService.js';

export const checkoutOrderController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {paymentMethod, recipientName, phoneNumber, addressLine1, addressLine2, city, state} = req.body;
        
        console.log(`Bắt đầu quá trình thanh toán cho user ${userId} với phương thức ${paymentMethod}`);
        
        // Tạo địa chỉ giao hàng
        const address = await db.Address.create({
            recipientName,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            userId
        });
        
        console.log(`Đã tạo địa chỉ giao hàng với ID: ${address.id}`);
        
        // Tạo đơn hàng và cập nhật stock (với transaction bên trong)
        const order = await createOrder(userId, address.id);
        console.log(`Đơn hàng được tạo thành công với ID: ${order.id}`);
        
        // Xử lý thanh toán
        const payment = await processPayment(order.id, paymentMethod, address.id, userId);
        console.log(`Đã tạo thanh toán với ID: ${payment.id}, trạng thái: ${payment.status}`);

        let responseData = {
            orderId: order.id,
            totalAmount: order.totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: payment.status,
            shippingAddress: address
        };

        // Nếu thanh toán qua VIETQR
        if (paymentMethod === 'vietqr') {
            console.log('Đang tạo mã QR cho thanh toán VietQR');
            const qrData = await generateVietQRCode({
                orderId: order.id,
                totalAmount: order.totalAmount
            });
            
            responseData.qrPayment = qrData;
            responseData.paymentInstructions = [
                "1. Mở ứng dụng Mobile Banking",
                "2. Quét mã QR hoặc tải hình ảnh QR",
                "3. Kiểm tra thông tin và xác nhận thanh toán",
                "4. Đơn hàng sẽ được xử lý sau khi nhận được thanh toán"
            ];
            
            console.log('Đã tạo mã QR thành công cho thanh toán');
        }

        console.log('Quá trình thanh toán hoàn tất');
        return res.status(200).json({
            errorCode: 0,
            message: 'Đặt hàng thành công',
            data: responseData
        });

    } catch (error) {
        console.error("Error in checkout:", error);
        
        // Phân loại lỗi để trả về phản hồi phù hợp
        if (error.message.includes('Giỏ hàng trống')) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Giỏ hàng trống, không thể đặt hàng'
            });
        } else if (error.message.includes('không đủ số lượng trong kho')) {
            return res.status(400).json({
                errorCode: 2,
                message: error.message
            });
        } else if (error.message.includes('Không tìm thấy thông tin sản phẩm')) {
            return res.status(400).json({
                errorCode: 3,
                message: error.message
            });
        } else {
            return res.status(500).json({
                errorCode: 999,
                message: 'Đã xảy ra lỗi khi xử lý đơn hàng: ' + error.message
            });
        }
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
        const orders = await db.Order.findAll({
            include: [
                {
                    model: db.User,
                    attributes: ['name', 'email']
                },
                {
                    model: db.OrderItem,
                    include: [{
                        model: db.Product,
                        attributes: ['name', 'image', 'price']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Lỗi khi lấy danh sách đơn hàng: ' + error.message
        });
    }
};

export const updateOrderStatusController = async (req, res) => {
    let transaction;
    try {
        // Bắt đầu transaction
        transaction = await db.sequelize.transaction();
        console.log('Bắt đầu transaction để cập nhật trạng thái đơn hàng');
        
        const { orderId } = req.params;
        const { status } = req.body;

        console.log(`Cập nhật trạng thái đơn hàng ${orderId} thành ${status}`);

        // Tìm đơn hàng
        const order = await db.Order.findByPk(orderId, { transaction });
        
        if (!order) {
            console.log(`Không tìm thấy đơn hàng với ID ${orderId}`);
            await transaction.rollback();
            return res.status(404).json({
                errorCode: 1,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        console.log(`Đơn hàng hiện tại có trạng thái: ${order.status}`);
        
        // Nếu đơn hàng được xác nhận (confirmed) và chưa được xác nhận trước đó
        if (status === 'confirmed' && order.status !== 'confirmed') {
            console.log('Đơn hàng đang được xác nhận, cập nhật stock...');
            
            // Tìm các item trong đơn hàng
            const orderItems = await db.OrderItem.findAll({
                where: { orderId: orderId },
                include: [{
                    model: db.Product
                }],
                transaction
            });
            
            console.log(`Tìm thấy ${orderItems.length} sản phẩm trong đơn hàng`);
            
            // Nếu không tìm thấy item nào trong đơn hàng
            if (orderItems.length === 0) {
                console.log('Không tìm thấy sản phẩm trong OrderItems, đơn hàng có thể không hợp lệ');
                
                // Tuy nhiên, chúng ta vẫn tiếp tục cập nhật trạng thái đơn hàng
                console.log('Tiếp tục cập nhật trạng thái đơn hàng mặc dù không có sản phẩm');
            } else {
                // Với mỗi sản phẩm trong đơn hàng
                for (const item of orderItems) {
                    const product = item.Product;
                    
                    if (!product) {
                        console.log(`Không tìm thấy thông tin sản phẩm cho item ${item.id}`);
                        continue;
                    }
                    
                    console.log(`Cập nhật stock cho sản phẩm: ${product.name} (ID: ${product.id})`);
                    console.log(`Stock hiện tại: ${product.stock}, Số lượng cần giảm: ${item.quantity}`);
                    
                    // Tính toán stock mới
                    const newStock = product.stock - item.quantity;
                    
                    // Kiểm tra nếu stock mới âm thì báo lỗi
                    if (newStock < 0) {
                        console.log(`Không đủ stock cho sản phẩm ${product.name}: hiện tại còn ${product.stock}, cần ${item.quantity}`);
                        await transaction.rollback();
                        return res.status(400).json({
                            errorCode: 1,
                            message: `Sản phẩm ${product.name} không đủ số lượng trong kho (Còn ${product.stock}, cần ${item.quantity})`
                        });
                    }
                    
                    // Cập nhật stock sản phẩm trong database thông qua model
                    await product.update({ stock: newStock }, { transaction });
                    
                    // Kiểm tra lại sau khi cập nhật
                    const updatedProduct = await db.Product.findByPk(product.id, { transaction });
                    console.log(`Đã cập nhật stock cho sản phẩm ${product.name}: ${product.stock} -> ${updatedProduct.stock}`);
                }
            }
        }
        
        // Cập nhật trạng thái đơn hàng
        await order.update({ status }, { transaction });
        console.log(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status}`);
        
        // Commit transaction
        await transaction.commit();
        console.log('Transaction đã được commit thành công');
        
        return res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật trạng thái đơn hàng thành công'
        });
    } catch (error) {
        // Nếu có lỗi, rollback transaction
        if (transaction) {
            console.error('Lỗi xảy ra, rollback transaction:', error);
            await transaction.rollback();
        }
        
        console.error('Update order status error:', error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Lỗi khi cập nhật trạng thái đơn hàng: ' + error.message
        });
    }
};