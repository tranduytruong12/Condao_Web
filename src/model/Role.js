'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsToMany(models.User, { through: 'UserRoles', foreignKey: 'roleId' });
        }
    }
    Role.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Role',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    });
    return Role;
};