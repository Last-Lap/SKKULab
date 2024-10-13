const { Client } = require("pg");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env')} );

const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

module.exports = db;