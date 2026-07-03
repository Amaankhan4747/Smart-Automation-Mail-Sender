const mongoose = require("mongoose");

/**
 * Connects to MongoDB using whatever connection string is supplied
 * via the MONGODB_URI environment variable. This keeps the database
 * fully dynamic — point it at a local instance, a Docker container,
 * or an Atlas cluster without touching any code.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env file.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      // Modern mongoose (>=6) no longer needs useNewUrlParser / useUnifiedTopology,
      // they are kept out intentionally to avoid deprecation warnings.
    });

    console.log(`MongoDB connected -> ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect is handled by the driver.");
    });

    return conn;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
