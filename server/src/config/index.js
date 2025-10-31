const { Sequelize } = require('sequelize');
require('dotenv').config();

const connect = new Sequelize('royal123_computer', 'royal123', 'Giaiu123@', {
    host: 'mysql-royal123.alwaysdata.net',
    dialect: 'mysql',
    port: 3306,
});

const connectDB = async () => {
    try {
        await connect.authenticate();
        console.log('Connect Database Success!');
    } catch (error) {
        console.error('error connect database:', error);
    }
};

module.exports = { connectDB, connect };
