import db from '../model/index.js';

export const createOrder = async (userId, addressId) => {
    try {
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
            }]
        });

        if (!cart || !cart.CartItems.length) {
            throw new Error('Giỏ hàng trống');
        }

        // Tính tổng tiền
        const totalAmount = cart.CartItems.reduce((sum, item) => {
            return sum + (item.Product.price * item.quantity);
        }, 0);

        // Tạo đơn hàng mới
        const order = await db.Order.create({
            userId: userId,
            addressId: addressId,
            totalAmount: totalAmount,
            status: 'pending'
        });

        // Tạo các item cho đơn hàng
        for (const cartItem of cart.CartItems) {
            await db.OrderItem.create({
                orderId: order.id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                price: cartItem.Product.price
            });

            // Cập nhật số lượng sản phẩm trong kho
            const product = await db.Product.findByPk(cartItem.productId);
            await product.update({
                stock: product.stock - cartItem.quantity
            });
        }

        // Xóa giỏ hàng sau khi đặt hàng thành công
        await db.CartItem.destroy({
            where: { cartId: cart.id }
        });

        await cart.destroy();

        return order;
    } catch (error) {
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