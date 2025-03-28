const Cart = require('../model/Cart');
const CartItem = require('../model/CartItems');

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Tìm giỏ hàng của user
        const cart = await Cart.findOne({
            where: { userId: userId }
        });

        if (!cart) {
            return res.status(404).json({
                message: "Không tìm thấy giỏ hàng"
            });
        }

        // Xóa tất cả các sản phẩm trong giỏ hàng
        await CartItem.destroy({
            where: { cartId: cart.id }
        });

        return res.status(200).json({
            message: "Đã xóa giỏ hàng thành công"
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};

module.exports = {
    clearCart
}; 