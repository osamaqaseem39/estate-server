const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const galleryRoutes = require('./routes/gallery');
const careerRoutes = require('./routes/careers');

dotenv.config();

const app = express();

const uploadsRoot = path.join(__dirname, '../uploads');
['properties', 'gallery', 'careers'].forEach((sub) => {
  const dir = path.join(uploadsRoot, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/** Normalize origin for comparison (no trailing slash). */
function normalizeOrigin(origin) {
  return (origin || '').replace(/\/$/, '');
}

const DEFAULT_BROWSER_ORIGINS = ['https://gt-estate-server-zhly.vercel.app'];

function buildAllowedOriginSet() {
  const set = new Set();
  DEFAULT_BROWSER_ORIGINS.forEach((o) => set.add(normalizeOrigin(o)));
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean)
    .forEach((o) => set.add(o));
  return set;
}

const allowedOrigins = buildAllowedOriginSet();

function isLocalDevOrigin(origin) {
  const o = normalizeOrigin(origin);
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(o);
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const o = normalizeOrigin(origin);
  if (allowedOrigins.has(o)) return true;
  if (isLocalDevOrigin(o)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn('CORS blocked Origin:', origin);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  if (state !== 1) {
    console.error('MongoDB not connected. Current state:', states[state] || 'unknown');
    return res.status(503).json({
      message: 'Database connection not ready',
      state: states[state] || 'unknown',
      details: {
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
      },
    });
  }
  next();
});

app.options('*', cors(corsOptions));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not set');
    }
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✨ MongoDB Connected Successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    global.mongoConnected = true;
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    global.mongoConnected = false;
    return false;
  }
};

mongoose.connection.on('connected', () => {
  global.mongoConnected = true;
  console.log('🔄 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  global.mongoConnected = false;
  console.error('🔴 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  global.mongoConnected = false;
  console.log('🔸 MongoDB connection disconnected');
  setTimeout(connectDB, 5000);
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/careers', careerRoutes);

app.use('/uploads/properties', express.static(path.join(uploadsRoot, 'properties')));
app.use('/uploads/gallery', express.static(path.join(uploadsRoot, 'gallery')));
app.use('/uploads/careers', express.static(path.join(uploadsRoot, 'careers')));

app.get('/', (req, res) => {
  const mongoStatus = {
    isConnected: mongoose.connection.readyState === 1,
    state:
      ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] ||
      'unknown',
    database: mongoose.connection.name || 'not connected',
    host: mongoose.connection.host || 'not connected',
    models: Object.keys(mongoose.models),
  };

  res.json({
    name: 'GT Estate API',
    status: mongoStatus.isConnected ? 'healthy' : 'unhealthy',
    message: mongoStatus.isConnected
      ? 'Real estate API — properties, gallery, careers'
      : 'Server running; database not connected',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    endpoints: {
      properties: '/api/properties',
      gallery: '/api/gallery',
      careers: '/api/careers/applications',
      auth: '/api/auth',
      docs: process.env.NODE_ENV !== 'production' ? '/api-docs' : null,
    },
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message && err.message.includes('Only PDF and Word')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

const startServer = async () => {
  let retries = 5;
  let connected = false;

  while (retries > 0 && !connected) {
    console.log(`Attempting to connect to MongoDB (${retries} retries left)...`);
    connected = await connectDB();
    if (!connected) {
      retries -= 1;
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  if (!connected) {
    console.error('Failed to connect to MongoDB after multiple attempts');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 GT Estate API on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    }
  });
};

startServer();
