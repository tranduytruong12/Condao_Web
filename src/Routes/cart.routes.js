const express = require('express');
const router = express.Router();
const { clearCart } = require('../controller/cart.controller');
const { verifyToken } = require('../middleware/auth');

// Route xóa giỏ hàng
router.delete('/clear', verifyToken, clearCart);

module.exports = router; 