const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

let _db;
let _client;

async function connectDb() {
    try {
        _client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 10000
        });
        await _client.connect();
        _db = _client.db(dbName);
        return _db;

    } catch(error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

function getDb() {
    if(!_db) {
        console.error("Db is not connected please connect db first. Try to call connectDb()");
    }
    return _db;
}

module.exports = { connectDb, getDb }
