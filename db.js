const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ MongoDB connection successful");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }

  // Handle initial connection error
  mongoose.connection.on("error", (err) => {
    console.error("Mongoose initial connection error:", err);
  });
};

module.exports = connectDB;
