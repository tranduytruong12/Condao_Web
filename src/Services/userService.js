require('dotenv').config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../model/index.js';
import Model from 'sequelize/lib/model';
const saltRounds = 10;

//check người dùng trong hệ thống
const checkExistingUser = async (email, username) => {
    const existingUsers = await db.User.findAll({
        where: {
            [db.Sequelize.Op.or]: [
                { email: email },
                { username: username }
            ]
        }
    });

    if (existingUsers.length > 0) {
        const errors = [];
        existingUsers.forEach(user => {
            if (user.email === email) errors.push("Email đã được sử dụng");
            if (user.username === username) errors.push("Tên người dùng đã được sử dụng");
        });
        throw new Error(errors.join(" và "));
    }
};

export const assignRoleToUser = async (userId, roleName) => {
    try {
        if (!roleName) {
            throw new Error("Role name is required");
        }

        const role = await db.Role.findOne({ where: { name: roleName } });
        if (!role) {
            throw new Error("Role not found");
        }
        await db.UserRole.create({
            userId: userId,
            roleId: role.id
        });
    } catch (error) {
        console.error("Error assigning role:", error);
        throw error;
    }
};

export const createUsers = async (email, username, password, phone) => {
    try {
        await checkExistingUser(email, username);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await db.User.create({
            email,
            username,
            password: hashedPassword,
            phone
        });
        return user;
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
};

export const loginUser = async (email, password) => {
    try {
        const user = await db.User.findOne({
            where: { email },
            include: [{
                model: db.Role,
                attributes: ['name'],
            }]
        });

        if (!user) {
            throw new Error("Thông tin đăng nhập không chính xác!");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Thông tin đăng nhập không chính xác!");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET không được định nghĩa! Kiểm tra file .env của bạn.");
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username,
                roles: user.Roles.map(role => role.name) // add role in the token
            }, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE,
            }
        );

        // Lấy thông tin về vai trò của người dùng
        const roles = user.Roles.map(role => role.name);
        return { token, user, roles };
    } catch (error) {
        console.error("Lỗi trong service:", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const users = await db.User.findAll({
            include: [{
                model: db.Role,
                attributes: ['name'],
                through: { attributes: [] }
            }]
        });
        return users;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}

export const deleteUser = async (id) => {
    try {
        const result = await db.User.destroy({
            where: { id: id }
        });
        return result;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
}

export const updateUser = async (id, updatedData) => {
    try {
        // Tách role ra khỏi updatedData nếu có
        const { role, ...userData } = updatedData;

        // Cập nhật thông tin người dùng
        const result = await db.User.update(userData, {
            where: {
                id: id
            }
        });

        // Nếu có role trong updatedData, cập nhật vai trò của người dùng
        if (role) {
            const user = await db.User.findByPk(id);
            if (!user) {
                throw new Error("User not found!");
            }

            const roleRecord = await db.Role.findOne({ where: { name: role } });
            if (!roleRecord) {
                throw new Error("Role not found!");
            }

            // Xóa các vai trò hiện tại của người dùng
            await db.UserRole.destroy({ where: { userId: id } });

            // Gán vai trò mới cho người dùng
            await db.UserRole.create({
                userId: id,
                roleId: roleRecord.id
            });
        }

        return result;
    } catch (error) {
        console.error("Error in service:", error);
        throw error;
    }
};