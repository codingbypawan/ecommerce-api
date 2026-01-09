const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = "your_mongodb_connection_string_here";
    await mongoose.connect(connectionString);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
    }
};

module.exports = connectDB;