const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to mock in-memory database
 */
const connect = async () => {
  // Close existing connection if any
  await mongoose.disconnect();

  // Create new in-memory MongoDB instance with specific version
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.12'
    }
  });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

/**
 * Close database connection and stop in-memory server
 */
const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all collections in the database
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase
};
