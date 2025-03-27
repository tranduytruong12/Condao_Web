import { createRole, getAllRoles, deleteRole, updateRole } from '../Services/roleService.js';

export const createRoleController = async (req, res) => {
    const { name, description } = req.body;

    try {
        const result = await createRole(name, description);
        console.log(result);
        return res.status(201).json({
            errorCode: 0,
            message: 'Role created successfully!',
            data: {
                name: name,
                description: description
            }
        });
    } catch (error) {
        console.error("Error creating role:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to create role.'
        });
    }
}

export const getAllRolesController = async (req, res) => {
    try {
        const roles = await getAllRoles();
        const roleCount = roles.length;
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            data: {
                roleCount: roleCount,
                roles: roles
            }
        });
    } catch (error) {
        console.error("Error getting all roles:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get all roles.'
        });
    }
}

export const deleteRoleController = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await deleteRole(id);
        if (result === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Role not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Role deleted successfully!',
        });
    } catch (error) {
        console.error("Error deleting role:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to delete role.'
        });
    }
}

export const updateRoleController = async (req, res) => {
    try {
        const { id } = req.body;
        const updatedData = req.body;
        const result = await updateRole(id, updatedData);
        if (result[0] === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'Role not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'Role updated successfully!',
        });
    } catch (error) {
        console.error("Error updating role:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to update role.'
        });
    }
}