require('dotenv').config();
const mysql = require('mysql2/promise');
import { Sequelize } from 'sequelize';

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,  //default: '3306' 3306
    user: process.env.DB_USER, //default: empty
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

try {
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

module.exports = connection;
module.exports = sequelize;