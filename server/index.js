require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const maintenanceRoutes = require("./routes/maintenanceroutes"); // Import maintenance routes

const app = express();
const PORT = process.env.PORT || 8080; // Set default port

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON requests

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB || 'mongodb://localhost:27017/maintenance_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error("Could not connect to MongoDB...", err);
    process.exit(1); // Exit if connection fails
  }
};

// Connect to the database
connectDB();

// API Routes
app.use("/api/users", userRoutes); // User routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/maintenance", maintenanceRoutes); // Maintenance routes

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Dormitory Management System!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing or further use
module.exports = app;