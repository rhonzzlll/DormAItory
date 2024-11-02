require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const maintenanceRoutes = require("./routes/maintenanceroutes"); // Import maintenance routes
const tenantRouter = require('./routes/tenantRouter'); // Adjust the path as needed
const bodyParser = require('body-parser');
const dormRoutes = require("./routes/Dorm"); // Ensure this path matches the actual file name
const chatRoutes = require("./routes/chatRoutes"); // Ensure this path matches the actual file name

const app = express();
const PORT = process.env.PORT || 8080; // Set default port

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json({ limit: '10mb' })); // Increase payload size limit to 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Increase URL-encoded payload size limit
app.use(bodyParser.json());

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
app.use('/api/tenants', tenantRouter); // Tenant routes
app.use('/api/dorms', dormRoutes); // Dorm routes
app.use('/api/chat', chatRoutes); // Chat routes



// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Dormitory Management System!");
});

app.get('/api/dorms/get/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await RoomModel.findById(roomId); // Assuming RoomModel is the model you're using
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing or further use
module.exports = app;