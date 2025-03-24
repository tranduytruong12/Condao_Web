import {
    loginUser, createUsers,
    getAllUsers, deleteUser,
    updateUser, assignRoleToUser
} from "../Services/userService.js";
import db from '../model/index.js';



export const createUserController = async (req, res) => {
    const { email, username, password, phone, role } = req.body;
    try {
        if (!email || !username || !password || !phone) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
            });
        }
        const result = await createUsers(email, username, password, phone);
        if (result.status === 'error') {
            return res.status(400).json({
                errorCode: 1,
                message: result.message
            });
        }

        if (1) {
            await assignRoleToUser(result.id, role);
        }

        return res.status(201).json({
            errorCode: 0,
            message: 'User created successfully!',
            user: {
                email: email,
                username: username,
                phone: phone,
                role: role
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to create user.'
        });
    }
};

export const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsers();
        const userCount = users.length;
        return res.status(200).json({
            errorCode: 0,
            message: 'Success!',
            data: {
                userCount: userCount,
                user: users
            }
        });
    } catch (error) {
        console.error("Error getting all users:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to get all users.'
        });
    }
};

export const deleteUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUser(id);
        if (result === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'User not found!'
            });
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'User deleted successfully!',
            data: {
                userCount: result,
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to delete user.'
        });
    }
}

export const updateUserController = async (req, res) => {
    try {
        const { id } = req.body;
        const updatedData = req.body;
        const result = await updateUser(id, updatedData);

        if (result[0] === 0) {
            return res.status(404).json({
                errorCode: 1,
                message: 'User not found!'
            });
        }

        // Lấy thông tin người dùng sau khi cập nhật
        const updatedUser = await db.User.findByPk(id, {
            include: [{
                model: db.Role,
                attributes: ['name'],
                through: { attributes: [] }
            }]
        });

        // Chuyển đổi thông tin vai trò thành mảng các tên vai trò
        const roles = updatedUser.Roles.map(role => role.name);

        return res.status(200).json({
            errorCode: 0,
            message: 'User updated successfully!',
            data: {
                user: {
                    email: updatedUser.email,
                    username: updatedUser.username,
                    phone: updatedUser.phone,
                    roles: roles
                }
            }
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            errorCode: 1,
            message: 'Server error! Unable to update user.'
        });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user, roles } = await loginUser(email, password);

        return res.status(200).json({
            errorCode: 0,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: roles
                }
            },
        });
    } catch (error) {
        return res.status(400).json({
            errorCode: 1,
            message: error.message
        });
    }
}

export const register = async (req, res) => {
    const { email, username, password, phone } = req.body;
    try {
        if (!email || !username || !password || !phone) {
            return res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng điền đầy đủ thông tin!'
            });
        }

        const result = await createUsers(email, username, password, phone);
        if (result.status === 'error') {
            return res.status(400).json({
                errorCode: 1,
                message: result.message
            });
        }

        // Assign default role 'User' to new register
        await assignRoleToUser(result.id, 'User');

        return res.status(201).json({
            errorCode: 0,
            message: 'Đăng ký thành công!',
            data: {
                user: {
                    email: result.email,
                    username: result.username,
                    phone: result.phone
                }
            }
        });
    } catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({
            errorCode: 1,
            message: error.message || 'Lỗi server!'
        });
    }
};