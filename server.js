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
const inquiryRoutes = require('./routes/inquiries');
const { getUploadsRoot, ensureUploadSubdir } = require('./uploadPaths');

dotenv.config();

const app = express();

const uploadsRoot = getUploadsRoot();
['properties', 'gallery', 'careers'].forEach((sub) => {
  ensureUploadSubdir(sub);
});

/** Normalize origin for comparison (no trailing slash). */
function normalizeOrigin(origin) {
  return (origin || '').replace(/\/$/, '');
}

/** Explicit browser origins (marketing site, dashboard, custom domains). Comma-separated in CORS_ORIGINS. */
function buildAllowedOriginSet() {
  const set = new Set();
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
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(o)) return true;
  // Non-prod: phone / another PC hitting your machine by LAN IP
  if (process.env.NODE_ENV !== 'production') {
    return /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
      o
    );
  }
  return false;
}

/** Dashboard / website on Vercel (https://*.vercel.app). Disable with CORS_STRICT=true. */
function isVercelFrontendOrigin(origin) {
  if (process.env.CORS_STRICT === 'true') return false;
  const o = normalizeOrigin(origin);
  try {
    const u = new URL(o);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return host === 'vercel.app' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

/** Public marketing site on gtestates.com.pk (apex and www). */
function isGtEstatesPkOrigin(origin) {
  const o = normalizeOrigin(origin);
  try {
    const u = new URL(o);
    const host = u.hostname.toLowerCase();
    if (host !== 'gtestates.com.pk' && host !== 'www.gtestates.com.pk') return false;
    if (u.protocol === 'https:') return true;
    if (process.env.NODE_ENV !== 'production' && u.protocol === 'http:') return true;
    return false;
  } catch {
    return false;
  }
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const o = normalizeOrigin(origin);
  if (allowedOrigins.has(o)) return true;
  if (isLocalDevOrigin(o)) return true;
  if (isVercelFrontendOrigin(o)) return true;
  if (isGtEstatesPkOrigin(o)) return true;
  return false;
}

const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
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
app.use('/api/inquiries', inquiryRoutes);

/** Simple root-level aliases (no /api prefix) */
app.use('/auth', authRoutes);
app.use('/properties', propertyRoutes);
app.use('/gallery', galleryRoutes);
app.use('/careers', careerRoutes);
app.use('/inquiries', inquiryRoutes);

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
      inquiries: '/api/inquiries',
      auth: '/api/auth',
      docs: process.env.NODE_ENV !== 'production' ? '/api-docs' : null,
    },
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'MulterError' && err.code) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        code: err.code,
      });
    }
    return res.status(400).json({ error: err.message, code: err.code });
  }
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
