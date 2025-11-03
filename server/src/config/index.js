const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'royal123_computer';
const dbUser = process.env.DB_USER || 'royal123';
const dbPassword = process.env.DB_PASSWORD || 'Giaiu123@';
const dbHost = process.env.DB_HOST || 'mysql-royal123.alwaysdata.net';
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const connect = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    port: dbPort,
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
