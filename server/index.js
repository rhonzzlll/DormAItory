require('dotenv').config({ path: './db.env' });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');

// Import routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const tenantRouter = require('./routes/tenantRouter');
const dormRoutes = require("./routes/dorm");
const chatRoutes = require("./routes/chatRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const messageRoutes = require('./routes/messageRoutes');

const paymentRoutes = require("./routes/paymentRoutes");
const announcementRoutes = require('./routes/announcementRoutes'); // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/api/messages', messageRoutes);
// Endpoint to handle file upload
app.post('/api/payments/upload', (req, res) => {
  let fileData = '';
  req.setEncoding('binary');

  req.on('data', chunk => {
    fileData += chunk;
  });

  req.on('end', () => {
    const boundary = req.headers['content-type'].split('; ')[1].replace('boundary=', '');
    const parts = fileData.split(`--${boundary}`);
    const filePart = parts.find(part => part.includes('Content-Disposition: form-data; name="file";'));

    if (!filePart) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileNameMatch = filePart.match(/filename="(.+)"/);
    if (!fileNameMatch) {
      return res.status(400).json({ error: 'No file name found' });
    }

    const fileName = fileNameMatch[1];
    const fileContent = filePart.split('\r\n\r\n')[1].split('\r\n--')[0];

    const filePath = path.join(uploadDir, fileName);
    fs.writeFile(filePath, fileContent, 'binary', err => {
      if (err) {
        return res.status(500).json({ error: 'Error saving file' });
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
      res.status(200).json({ url: fileUrl });
    });
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB || 'mongodb://127.0.0.1:27017/dms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error("Could not connect to MongoDB...", err);
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// API Routestfgf
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/maintenancerequest", maintenanceRoutes);
app.use('/api/tenants', tenantRouter);
app.use('/api/dorms', dormRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/contact-messages', messageRoutes); // Updated path
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/records', paymentRoutes);
app.use('/api/announcements', announcementRoutes); // Use the announcement routes

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Dormitory Management System!");
});

// Example route for fetching a dorm by ID
app.get('/api/dorms/get/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await Dorm.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing or further use
module.exports = app;