const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');
const { USER_ROLES } = require('../constants/userRoles');

const User = connect.define(
    'users',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isAdmin: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: USER_ROLES.CUSTOMER,
            validate: {
                isIn: [Object.values(USER_ROLES)],
            },
        },
        typeLogin: {
            type: DataTypes.ENUM('google', 'email'),
            allowNull: false,
        },
    },
    {
        freezeTableName: true, // 👈 Giữ nguyên tên bảng là 'users'
        timestamps: true,
    },
);

module.exports = User;
