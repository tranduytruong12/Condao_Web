const express = require('express');
const routerAPI = express.Router();

const {
    register, Login, createUserController,
    getAllUsersController, deleteUserController,
    updateUserController
} = require("../Controller/userController");

const { uploadFileController } = require("../Controller/fileController");
const {
    createCategoryController, getAllCategoriesController,
    deleteCategoryController, updateCategoryController, 
} = require("../Controller/categoryController");

const {
    createProductController, getAllProductsController,
    getProductByIdController, deleteProductController, updateProductController,
    getProductsByCategoryController, searchProductsController
} = require("../Controller/productController");

const {
    createRoleController, getAllRolesController,
    deleteRoleController, updateRoleController
} = require("../Controller/roleController");

const { verifyToken, checkRole } = require("../Middleware/authMiddleware");
const { verifyTokenController } = require("../Controller/authController");
const {
    addToCartController, getCartController,
    getCartItemsController, removeFromCartController,
    updateCartController
} = require("../Controller/cartController");

const { checkoutOrderController, getOrderDetailsController, updateOrderStatusController, getAllOrdersController } = require('../Controller/orderController');
const { generateVietQRController } = require('../Controller/paymmentController');

routerAPI.post('/login', Login);
routerAPI.post('/register', register);
routerAPI.get('/verify-token', verifyTokenController);

// Api cho category
routerAPI.post("/category", verifyToken, checkRole(['Admin']), createCategoryController);
routerAPI.get('/category-all', getAllCategoriesController);
routerAPI.delete('/delete-category', verifyToken, checkRole(['Admin']), deleteCategoryController);
routerAPI.put('/update-category', verifyToken, checkRole(['Admin', 'staff']), updateCategoryController);

//api cho product
routerAPI.post('/product', verifyToken, checkRole(['Admin']), createProductController);
routerAPI.get('/product-all', getAllProductsController);
routerAPI.get('/product/:id', getProductByIdController);
routerAPI.get('/product/category/:categoryId', getProductsByCategoryController);
routerAPI.get('/products/search', searchProductsController);
routerAPI.delete('/delete-product/:id', verifyToken, checkRole(['Admin']), deleteProductController);
routerAPI.put('/update-product', verifyToken, checkRole(['Admin', 'staff']), updateProductController);

//Api cho user 
routerAPI.post('/create-user', verifyToken, checkRole(['Admin']), createUserController);
routerAPI.get('/user-all', verifyToken, checkRole(['Admin']), getAllUsersController);
routerAPI.delete('/delete-user/:id', verifyToken, checkRole(['Admin']), deleteUserController);
routerAPI.put('/update-user', verifyToken, checkRole(['Admin']), updateUserController);
routerAPI.post('/file', uploadFileController);

//Api cho role
routerAPI.post('/create-role',  verifyToken, checkRole(['Admin']), createRoleController);
routerAPI.get('/role-all', getAllRolesController);
routerAPI.delete('/delete-role', verifyToken, checkRole(['Admin']), deleteRoleController);
routerAPI.put('/update-role', verifyToken, checkRole(['Admin']), updateRoleController);

//Api cho cart
routerAPI.post('/cart/add', verifyToken, addToCartController);
routerAPI.get('/cart', verifyToken, getCartController);
routerAPI.get('/cart/items', verifyToken, getCartItemsController);
routerAPI.delete('/cart/delete/:cartItemId', verifyToken, removeFromCartController);
routerAPI.put('/cart/update/:cartItemId', verifyToken, updateCartController);

// Api cho order
routerAPI.post('/order/checkout', verifyToken, checkoutOrderController);
routerAPI.get('/orders', verifyToken, getAllOrdersController);
routerAPI.get('/order/:orderId', verifyToken, getOrderDetailsController);
routerAPI.put('/order/:orderId/status', verifyToken, updateOrderStatusController);

// API cho thanh toán bằng QR Code
routerAPI.post('/payment/vietqr', verifyToken, generateVietQRController);

module.exports = routerAPI;