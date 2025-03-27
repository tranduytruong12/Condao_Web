// src/Controller/authController.js
import jwt from 'jsonwebtoken';
require('dotenv').config();

export const verifyTokenController = (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ errorCode: 1, message: "Không có token!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ errorCode: 0, message: "Token hợp lệ!", user: decoded });
    } catch (error) {
        return res.status(403).json({ errorCode: 1, message: "Token không hợp lệ!" });
    }
};