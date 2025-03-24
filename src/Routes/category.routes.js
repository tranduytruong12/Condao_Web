import express from 'express';
import { 
    fetchAllCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controllers/category.controller.js';

const router = express.Router();

// Get all categories
router.get('/category-all', fetchAllCategories);

// Create new category
router.post('/category', createCategory);

// Update category
router.put('/update-category', updateCategory);

// Delete category
router.delete('/delete-category/:id', deleteCategory);

export default router; 