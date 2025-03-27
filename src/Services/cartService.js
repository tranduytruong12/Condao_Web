import db from '../model/index.js';

export const getOrCreateCart = async (userId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                userId: userId,
                status: 'active'
            }
        });

        if (!cart) {
            cart = await db.Cart.create({
                userId: userId,
                status: 'active'
            });
        }

        return cart;
    } catch (error) {
        throw error;
    }
};

export const addToCart = async (userId, productId, quantity) => {
    try {
        const cart = await getOrCreateCart(userId);

        // Kiểm tra sản phẩm tồn tại
        const product = await db.Product.findByPk(productId);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra số lượng trong kho
        if (product.stock < quantity) {
            throw new Error('Số lượng sản phẩm trong kho không đủ');
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        let cartItem = await db.CartItem.findOne({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        if (cartItem) {
            // Nếu đã có, cập nhật số lượng
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Nếu chưa có, tạo mới
            cartItem = await db.CartItem.create({
                cartId: cart.id,
                productId: productId,
                quantity: quantity
            });
        }

        // Lấy thông tin chi tiết của cart item kèm thông tin sản phẩm
        const cartItemWithProduct = await db.CartItem.findOne({
            where: { id: cartItem.id },
            include: [{
                model: db.Product,
                attributes: ['id', 'name', 'price', 'image']
            }]
        });

        return cartItemWithProduct;
    } catch (error) {
        throw error;
    }
};

export const getCart = async (userId) => {
    try {
        const cart = await db.Cart.findOne({
            where: {
                userId: userId,
                status: 'active'
            },
            include: [{
                model: db.CartItem,
                include: [{
                    model: db.Product,
                    attributes: ['id', 'name', 'price', 'image']
                }]
            }]
        });

        return cart;
    } catch (error) {
        throw error;
    }
};

export const getCartItems = async (userId) => {
    try {
        const cart = await db.Cart.findOne({
            where: {
                userId: userId,
                status: 'active'
            }
        });

        if (!cart) {
            return [];
        }

        const cartItems = await db.CartItem.findAll({
            where: {
                cartId: cart.id
            },
            include: [{
                model: db.Product,
                attributes: ['id', 'name', 'price', 'image', 'stock', 'description']
            }],
            attributes: ['id', 'quantity', 'cartId', 'productId']
        });

        return cartItems;
    } catch (error) {
        throw error;
    }
};

export const removeFromCart = async (userId, cartItemId) => {
    try {
        // Kiểm tra giỏ hàng của user
        const cart = await db.Cart.findOne({
            where: {
                userId: userId,
                status: 'active'
            }
        });

        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }

        // Kiểm tra và xóa item
        const result = await db.CartItem.destroy({
            where: {
                id: cartItemId,
                cartId: cart.id
            }
        });

        if (result === 0) {
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const updateFromCart = async (userId, cartItemId, quantity) => {
    try {
        // Kiểm tra giỏ hàng của user
        const cart = await db.Cart.findOne({
            where: {
                userId: userId,
                status: 'active'
            }
        });

        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }

        // Tìm cart item và product
        const cartItem = await db.CartItem.findOne({
            where: {
                id: cartItemId,
                cartId: cart.id
            },
            include: [{
                model: db.Product
            }]
        });

        if (!cartItem) {
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        }

        // Kiểm tra số lượng tồn kho
        if (cartItem.Product.stock < quantity) {
            throw new Error('Số lượng sản phẩm trong kho không đủ');
        }

        // Cập nhật số lượng
        cartItem.quantity = quantity;
        await cartItem.save();

        // Lấy thông tin chi tiết sau khi cập nhật
        const updatedCartItem = await db.CartItem.findOne({
            where: { id: cartItemId },
            include: [{
                model: db.Product,
                attributes: ['id', 'name', 'price', 'image', 'stock']
            }]
        });

        return updatedCartItem;
    } catch (error) {
        throw error;
    }
};