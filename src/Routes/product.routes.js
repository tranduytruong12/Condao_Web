import express from 'express';
import { 
    fetchAllProducts, 
    fetchProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    searchProducts,
    fetchProductsByCategory
} from '../controllers/product.controller.js';

const router = express.Router();

// Get all products
router.get('/product-all', fetchAllProducts);

// Get product by ID
router.get('/product/:id', fetchProductById);

// Create new product
router.post('/product', createProduct);

// Update product
router.put('/update-product', updateProduct);

// Delete product
router.delete('/delete-product/:id', deleteProduct);

// Search products
router.get('/products/search', searchProducts);

// Get products by category
router.get('/product/category/:categoryId', fetchProductsByCategory);

export default router; 