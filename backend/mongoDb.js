const { MongoClient } = require('mongodb');
const config = require('./config/env');

let _db;
let _client;

async function connectDb() {
  try {
    _client = new MongoClient(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20
    });
    await _client.connect();
    _db = _client.db(config.mongoName);
    await ensureIndexes(_db);
    return _db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
}

async function ensureIndexes(db) {
  try {
    await db.collection('users').createIndex({ userName: 1 }, { unique: true });
    await db.collection('contactUsData').createIndex({ createdAt: -1 });
    await db.collection('PersonalData').createIndex({ _id: 1 });
  } catch (error) {
    // Index creation can fail on existing duplicate data; log without blocking boot.
    console.warn('[db] index setup warning:', error.message);
  }
}

function getDb() {
  if (!_db) {
    throw new Error('Database is not connected. Call connectDb() first.');
  }
  return _db;
}

async function pingDb() {
  if (!_db) return false;
  try {
    await _db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

async function closeDb() {
  if (_client) {
    await _client.close();
    _client = undefined;
    _db = undefined;
  }
}

module.exports = { connectDb, getDb, pingDb, closeDb };
