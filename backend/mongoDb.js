const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

let _db;

function connectDb() {

    try {
        const client = new MongoClient(uri);
        client.connect();
        _db = client.db(dbName)
        return _db;

    } catch(error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

function getDb() {
    if(!_db) {
        console.error("Db is not connected please connect db first. Try to call connectDb()");
    }
    return _db;
}

module.exports = { connectDb, getDb }