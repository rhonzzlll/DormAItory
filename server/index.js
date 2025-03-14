require('dotenv').config({ path: './db.env' });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

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
const eventRoutes = require("./routes/events");

const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['https://dormaitory.online', 'http://dormaitory.online', 'http://localhost:3000','http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory with proper permissions
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.chmodSync(uploadDir, '755');
}

// File upload endpoint
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
        console.error('File save error:', err);
        return res.status(500).json({ error: 'Error saving file' });
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
      res.status(200).json({ url: fileUrl });
    });
  });
});

// Database connection with monitoring
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB || 'mongodb://127.0.0.1:27017/dms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log("Connected to MongoDB...");

    // Monitor database connection
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection state:', mongoose.connection.readyState);

    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (err) {
    console.error("Could not connect to MongoDB...", err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = {
      connected: mongoose.connection.readyState === 1,
      collections: await mongoose.connection.db.listCollections().toArray(),

      stats: await mongoose.connection.db.stats()
    };
    res.json(dbState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/maintenancerequest", maintenanceRoutes);
app.use('/api/tenants', tenantRouter);
app.use('/api/dorms', dormRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/contact-messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/records', paymentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Dormitory Management System API!");
});
// Example dorm route with error handling
app.get('/api/dorms/get/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const room = await mongoose.model('Dorm').findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Generic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
