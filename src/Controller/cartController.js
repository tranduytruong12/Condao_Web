import { addToCart, getCart, getCartItems, removeFromCart, updateFromCart } from '../Services/cartService.js';

export const addToCartController = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId; // Lấy từ middleware xác thực

        const cartItem = await addToCart(userId, productId, quantity);

        return res.status(200).json({
            errorCode: 0,
            message: 'Thêm sản phẩm vào giỏ hàng thành công',
            data: cartItem
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const getCartController = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy từ middleware xác thực

        const cart = await getCart(userId);

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy thông tin giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        console.error("Error getting cart:", error);
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const getCartItemsController = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy từ middleware xác thực

        const cartItems = await getCartItems(userId);

        return res.status(200).json({
            errorCode: 0,
            message: 'Lấy thông tin các sản phẩm trong giỏ hàng thành công',
            data: cartItems
        });
    } catch (error) {
        console.error("Error getting cart items:", error);
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const removeFromCartController = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user.userId;

        await removeFromCart(userId, cartItemId);

        return res.status(200).json({
            errorCode: 0,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
};

export const updateCartController = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;

        const updatedItem = await updateFromCart(userId, cartItemId, quantity);

        return res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật số lượng sản phẩm thành công',
            data: updatedItem
        });
    } catch (error) {
        console.error("Error updating cart item:", error);
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
};