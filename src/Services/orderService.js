import db from '../model/index.js';

export const createOrder = async (userId, addressId) => {
    let transaction;
    try {
        // Bắt đầu transaction
        transaction = await db.sequelize.transaction();
        console.log(`Bắt đầu transaction để tạo đơn hàng cho user ${userId}`);
        
        // Lấy giỏ hàng hiện tại của user
        const cart = await db.Cart.findOne({
            where: { 
                userId: userId,
                status: 'active'
            },
            include: [{
                model: db.CartItem,
                include: [{
                    model: db.Product
                }]
            }],
            transaction
        });

        if (!cart || !cart.CartItems || !cart.CartItems.length) {
            console.log('Giỏ hàng trống, không thể tạo đơn hàng');
            await transaction.rollback();
            throw new Error('Giỏ hàng trống');
        }

        console.log(`Tìm thấy giỏ hàng (ID: ${cart.id}) với ${cart.CartItems.length} sản phẩm`);

        // Kiểm tra stock trước khi tạo đơn hàng
        for (const cartItem of cart.CartItems) {
            const product = cartItem.Product;
            if (!product) {
                console.log(`Không tìm thấy thông tin sản phẩm cho item trong giỏ hàng`);
                await transaction.rollback();
                throw new Error(`Không tìm thấy thông tin sản phẩm cho item trong giỏ hàng`);
            }

            console.log(`Kiểm tra stock cho sản phẩm ${product.name}: hiện có ${product.stock}, cần ${cartItem.quantity}`);
            if (product.stock < cartItem.quantity) {
                console.log(`Sản phẩm ${product.name} không đủ số lượng trong kho`);
                await transaction.rollback();
                throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho, không đủ số lượng ${cartItem.quantity} bạn yêu cầu`);
            }
        }

        // Tính tổng tiền
        const totalAmount = cart.CartItems.reduce((sum, item) => {
            return sum + (item.Product.price * item.quantity);
        }, 0);

        console.log(`Tổng tiền đơn hàng: ${totalAmount}`);

        // Tạo đơn hàng mới
        const order = await db.Order.create({
            userId: userId,
            addressId: addressId,
            totalAmount: totalAmount,
            status: 'pending'
        }, { transaction });

        console.log(`Đã tạo đơn hàng mới với ID: ${order.id}`);

        // Tạo các OrderItem từ CartItem
        for (const cartItem of cart.CartItems) {
            await db.OrderItem.create({
                orderId: order.id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                price: cartItem.Product.price
            }, { transaction });

            console.log(`Đã tạo OrderItem cho sản phẩm ${cartItem.Product.name}, số lượng: ${cartItem.quantity}`);

            // Cập nhật số lượng sản phẩm trong kho
            const product = await db.Product.findByPk(cartItem.productId, { transaction });
            const newStock = product.stock - cartItem.quantity;
            
            await product.update({
                stock: newStock
            }, { transaction });

            console.log(`Đã cập nhật stock cho sản phẩm ${product.name}: ${product.stock} -> ${newStock}`);
        }

        // Xóa giỏ hàng sau khi đặt hàng thành công
        await db.CartItem.destroy({
            where: { cartId: cart.id },
            transaction
        });

        console.log(`Đã xóa các CartItem của giỏ hàng ${cart.id}`);

        // Xóa cart hoặc đánh dấu là đã sử dụng
        await cart.destroy({ transaction });
        console.log(`Đã xóa giỏ hàng ${cart.id}`);

        // Commit transaction
        await transaction.commit();
        console.log('Transaction đã được commit thành công, đơn hàng được tạo hoàn tất');

        return order;
    } catch (error) {
        // Nếu có lỗi, rollback transaction
        if (transaction) {
            console.error('Lỗi xảy ra, rollback transaction:', error);
            await transaction.rollback();
        }
        throw error;
    }
};

export const getOrderDetails = async (orderId) => {
    try {
        const order = await db.Order.findByPk(orderId, {
            include: [
                {
                    model: db.OrderItem,
                    include: [{
                        model: db.Product,
                        attributes: ['name', 'image']
                    }]
                },
                {
                    model: db.Address,
                    attributes: ['recipientName', 'phoneNumber', 'addressLine1', 'addressLine2', 'city', 'state']
                },
                {
                    model: db.Payment,
                    attributes: ['paymentMethod', 'status', 'paymentDate']
                }
            ]
        });

        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        return order;
    } catch (error) {
        throw error;
    }
};