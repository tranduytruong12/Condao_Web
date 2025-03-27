'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserRole extends Model {
        static associate(models) {
            // define association here
        }
    }
    UserRole.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: DataTypes.UUID,
        roleId: DataTypes.UUID
    }, {
        sequelize,
        modelName: 'UserRole',
    });
    return UserRole;
};