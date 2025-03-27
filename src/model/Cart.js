'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            // định nghĩa relationships
            Cart.belongsTo(models.User, { foreignKey: 'userId' });
            Cart.hasMany(models.CartItem, { foreignKey: 'cartId' });
        }
    }
    Cart.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'Cart',
    });
    return Cart;
};