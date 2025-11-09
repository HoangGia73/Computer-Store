const { Sequelize } = require('sequelize');
const config = require('./env');

const dbName = config.DB_NAME;
const dbUser = config.DB_USER;
const dbPassword = config.DB_PASSWORD;
const dbHost = config.DB_HOST;
const dbPort = config.DB_PORT;

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
