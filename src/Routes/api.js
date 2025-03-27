import express from 'express';
const routerAPI = express.Router();


import {
    register, Login, createUserController,
    getAllUsersController, deleteUserController,
    updateUserController
} from "../Controller/userController.js";

import { uploadFileController } from "../Controller/fileController.js";
import {
    createCategoryController, getAllCategoriesController,
    deleteCategoryController, updateCategoryController, 
} from "../Controller/categoryController.js";

import {
    createProductController, getAllProductsController,
    getProductByIdController, deleteProductController, updateProductController,
    getProductsByCategoryController, searchProductsController
} from "../Controller/productController.js";

import {
    createRoleController, getAllRolesController,
    deleteRoleController, updateRoleController
} from "../Controller/roleController.js";

import { verifyToken, checkRole } from "../Middleware/authMiddleware.js"; // Thay đổi import
import { verifyTokenController } from "../Controller/authController.js"; // Thay đổi import
import {
    addToCartController, getCartController,
    getCartItemsController, removeFromCartController,
    updateCartController
} from "../Controller/cartController.js";

import { checkoutOrderController, getOrderDetailsController } from '../Controller/orderController.js';
import { generateVietQRController, checkPaymentStatusController } from '../Controller/paymmentController.js';

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
routerAPI.get('/products/search', searchProductsController); // Thêm route cho tìm kiếm sản phẩm
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
routerAPI.get('/cart/items', verifyToken, getCartItemsController); // Add this new route
routerAPI.delete('/cart/delete/:cartItemId', verifyToken, removeFromCartController);
routerAPI.put('/cart/update/:cartItemId', verifyToken, updateCartController);

// API payment routes
routerAPI.post('/payment/vietqr', verifyToken, generateVietQRController);
routerAPI.get('/payment/:orderId/status', verifyToken, checkPaymentStatusController);

// Api cho order
routerAPI.post('/order/checkout', verifyToken, checkoutOrderController);
routerAPI.get('/order/:orderId', verifyToken, getOrderDetailsController);


module.exports = routerAPI;