'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, { foreignKey: 'userId' });
      Payment.belongsTo(models.Order, { foreignKey: 'orderId' });
      Payment.belongsTo(models.Address, { foreignKey: 'addressId' });
    }
  }
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    orderId: DataTypes.UUID,
    addressId: {
      type: DataTypes.UUID,
      references: {
        model: 'Addresses',
        key: 'id'
      }
    },
    amount: DataTypes.FLOAT,
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['cod', 'vietqr']] // Thêm 'cod' vào danh sách các phương thức thanh toán hợp lệ
      }
    },
    status: DataTypes.STRING,
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};