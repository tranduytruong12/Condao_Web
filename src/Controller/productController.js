import { uploadSingleFile } from '../Services/fileService.js';
import { createProduct, getAllProducts, getProductById, deleteProduct, updateProduct, getProductsByCategory, searchProducts } from '../Services/productService.js';

export const createProductController = async (req, res) => {
    try {
        const { name, description, stock, price, categoryId, image } = req.body;

        let imageUrl = image;

        // 🛑 Kiểm tra nếu có file đính kèm
        if (req.files && req.files.image) {
            let result = await uploadSingleFile(req.files.image);
            imageUrl = result.name;
        }

        if (!imageUrl) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Image is required!'
            });
        }

        // 🛠 Lưu vào database
        const productData = { name, description, stock, price, categoryId, image: imageUrl };
        const product = await createProduct(productData);

        return res.status(201).json({
            errorCode: 0,
            message: 'Product created successfully!',
            product: product
        });
    } catch (error) {
        console.error("❌ Error creating product:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to create product.',
            error: error.message
        });
    }
};


export const getAllProductsController = async (req, res) => {
    try {
        const products = await getAllProducts();
        const productCount = products.length;
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            data: {
                productCount: productCount,
                products: products
            }
        });
    } catch (error) {
        console.error("Error getting all products:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get all products.'
        });
    }
}

export const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Product not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            product: product
        });
    } catch (error) {
        console.error("Error getting product by id:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get product by id.'
        });
    }
}

export const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteProduct(id);
        if (result === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Product not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Product deleted successfully!',
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to delete product.'
        });
    }
}

export const updateProductController = async (req, res) => {
    try {
        const { id, name, description, stock, price, categoryId, image } = req.body;
        console.log("🚀 Received product data:", req.body);

        let imageUrl = image;
        console.log("🚀 Initial imageUrl:", imageUrl);

        if (req.files && req.files.image) {
            console.log("📂 File data received:", req.files.image);
            let result = await uploadSingleFile(req.files.image);
            imageUrl = result.name;
            console.log("📂 Uploaded image name:", imageUrl);
        }

        const updatedData = { name, description, stock, price, categoryId, image: imageUrl };
        console.log("� Data before saving to DB:", updatedData);

        const result = await updateProduct(id, updatedData);
        if (result[0] === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Product not found!'
            });
        }

        console.log("✅ Product updated successfully:", result);

        return res.status(200).json({
            errorCode: 0,
            message: 'Product updated successfully!',
            data: updatedData
        });
    } catch (error) {
        console.error("❌ Error updating product:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to update product.'
        });
    }
};

export const getProductsByCategoryController = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await getProductsByCategory(categoryId);
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            data: products
        });
    } catch (error) {
        console.error("Error getting products by category:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get products by category.'
        });
    }
};

export const searchProductsController = async (req, res) => {
    try {
        const { name, categoryId, categoryName } = req.query;
        const result = await searchProducts(name, categoryId, categoryName);
        
        return res.status(200).json({
            errorCode: 0,
            message: 'Tìm kiếm thành công!',
            data: {
                productCount: result.productCount,
                products: result.products
            }
        });
    } catch (error) {
        console.error("❌ Error searching products:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Lỗi server khi tìm kiếm sản phẩm!'
        });
    }
};