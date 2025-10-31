/* const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const morgan = require('morgan');

// Routes
const tmerRoutes = require('./routes/tmers');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const imageUploadRoutes = require('./routes/image-upload');
const photoUploadRoutes = require('./routes/photo-upload'); // Add this line

// Initialize Express
const app = express();

// Database Connection
mongoose.connect(config.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logger

// Debugging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// API Routes
app.use('/api/v1/tmers', tmerRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/image-upload', imageUploadRoutes);
app.use('/api/v1/photo-upload', photoUploadRoutes); // Add this line

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  console.error('Full error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      details: err.details
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${config.DB_URI}`);
  console.log(`S3 Bucket: ${config.S3_BUCKET}`);
});

module.exports = app;
 
 */
  

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const Tmer = require('./models/tmer');
const FakeDb = require('./fake-db');
const path = require('path');
const https = require('https');
const fs = require('fs');
const cors = require('cors');

// Routes
const tmerRoutes = require('./routes/tmers');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

// 🌟 CRITICAL FIX: Now imageUploadRoutes exports an actual Express Router
const imageUploadRoutes = require('./routes/image-upload');
console.log('📷 imageUploadRoutes loaded'); // This log is now more meaningful

const photoUploadRoutes = require('./routes/photo-upload');
const reviewRoutes = require('./routes/reviews');

// MongoDB Connection
mongoose.connect(config.DB_URI).then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    const fakeDb = new FakeDb();
    // await fakeDb.seedDb();
  }
});

const app = express();

// CORS Configuration (keep as is, it's good)
const allowedOrigins = [
  'https://localhost:4200', // Angular dev server
  'https://t3llme.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(bodyParser.json());

// Static assets
app.use('/assets', express.static('D:/angular/Rental/app2023-10-17New/tm2-app/src/assets'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // For local uploads if any

// API Routes
app.use('/api/v1/tmers', tmerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// ✅ Photo Upload (for Tmers) - already fixed and working
app.use('/api/v1', photoUploadRoutes);

// ✅ Main Photo Upload (for Profile, etc.) - NOW CORRECTLY MOUNTED
// This will make routes like /api/v1/main-photo-upload accessible
app.use('/api/v1', imageUploadRoutes);

// Production Configuration (keep as is)
if (process.env.NODE_ENV === 'production') {
  const appPath = path.join(__dirname, '..', 'dist', 'tm2-app');
  app.use(express.static(appPath));

  app.get('*', function (req, res) {
    res.sendFile(path.resolve(appPath, 'index.html'));
  });
}

// HTTPS Configuration (keep as is)
const sslOptions = {
  key: fs.readFileSync('D:/angular/Rental/tm2-app/ssl/key.pem'),
  cert: fs.readFileSync('D:/angular/Rental/tm2-app/ssl/cert.pem')
};

const PORT = process.env.PORT || 3001;

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});

if (process.env.NODE_ENV === 'production') {
  const httpApp = express();
  httpApp.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
  });
  httpApp.listen(80, () => {
    console.log('HTTP server running on port 80 for redirects');
  });
}