import { createCategory, getAllCategories, deleteCategory, updateCategory } from "../Services/categoryService.js";

export const createCategoryController = async (req, res) => {
    const { name, description } = req.body;

    try {
        const result = await createCategory(name, description);
        return res.status(201).json({
            errorCode: 0,
            message: 'Category created successfully!',
            category: {
                name: name,
                description: description
            }
        });
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to create category.'
        });
    }
}

export const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const categoryCount = categories.length;
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            data: {
                categoryCount: categoryCount,
                categories: categories
            }
        });
    } catch (error) {
        console.error("Error getting all categories:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get all categories.'
        });
    }
}

export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await deleteCategory(id);
        if (result === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Category not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Category deleted successfully!',
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to delete category.'
        });
    }
}

export const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.body;
        const updatedData = req.body;
        const result = await updateCategory(id, updatedData);
        if (result[0] === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Category not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Category updated successfully!',
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to update category.'
        });
    }
}