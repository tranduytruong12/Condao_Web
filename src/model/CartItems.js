'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CartItem extends Model {
        static associate(models) {
            // định nghĩa relationships
            CartItem.belongsTo(models.Cart, { foreignKey: 'cartId' });
            CartItem.belongsTo(models.Product, { foreignKey: 'productId' });
        }
    }
    CartItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        cartId: {
            type: DataTypes.UUID,
            references: {
                model: 'Carts',
                key: 'id'
            }
        },
        productId: {
            type: DataTypes.UUID,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                min: 1
            }
        }
    }, {
        sequelize,
        modelName: 'CartItem',
    });
    return CartItem;
};