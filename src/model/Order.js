'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.belongsTo(models.Address, { foreignKey: 'addressId' });  // Thêm relationship này
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
      Order.hasMany(models.Payment, { foreignKey: 'orderId' });
    }
  }
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    addressId: DataTypes.UUID,  // Thêm field này
    totalAmount: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};