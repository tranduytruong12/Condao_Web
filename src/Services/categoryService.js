import db from "../model/index.js";

export const createCategory = async (name, description) => {
    try {
        const category = await db.Category.create({
            name: name,
            description: description
        });
        return category;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}

export const getAllCategories = async () => {
    try {
        const categories = await db.Category.findAll();
        return categories;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}

export const deleteCategory = async (id) => {
    try {
        const result = await db.Category.destroy({
            where: {
                id: id
            }
        });
        return result;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}

export const updateCategory = async (id, updatedData) => {
    try {
        const result = await db.Category.update(updatedData, {
            where: {
                id: id
            }
        });
        return result;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}