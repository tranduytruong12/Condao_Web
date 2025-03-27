import db from '../model/index.js';

export const createRole = async (name, description) => {
    try {
        const role = await db.Role.create({
            name: name,
            description: description
        });
        return role;
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
};

export const getAllRoles = async () => {
    try {
        const roles = await db.Role.findAll();
        return roles;
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
};

export const deleteRole = async (id) => {
    try {
        const result = await db.Role.destroy({
            where: {
                id: id
            }
        });
        return result;
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
};

export const updateRole = async (id, updatedData) => {
    try {
        const result = await db.Role.update(updatedData, {
            where: {
                id: id
            }
        });
        return result;
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
};