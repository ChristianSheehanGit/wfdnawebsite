const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const firebaseAdmin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const firestoreDb = require('./services/firestoreDbService');
const cloudStorage = require('./services/cloudStorageService');
const caseRoutes = require('./routes/caseRoutes');
const teamRoutes = require('./routes/teamRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Load environment variables from .env
dotenv.config();

// ---------------------------------------------------------------------------
// Firebase Admin SDK Initialization
// ---------------------------------------------------------------------------
// Credentials are read from environment variables (see .env file for reference).
// In production, set these via your deployment platform (e.g., Railway, Render,
// Google Cloud Run, etc.) -- do NOT commit real credentials to version control.
// ---------------------------------------------------------------------------
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (firebasePrivateKey) {
  // The private key in .env may have literal \n escape sequences.
  // Replace them with actual newlines and handle optional double-quotes.
  firebasePrivateKey = firebasePrivateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
}

let firebaseInitialized = false;

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
  try {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: firebasePrivateKey,
      }),
    });
    firebaseInitialized = true;
    console.log('[Firebase] Admin SDK initialized successfully.');
  } catch (err) {
    console.error('[Firebase] Failed to initialize Admin SDK:', err.message);
  }
} else {
  console.warn(
    '[Firebase] Missing credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). ' +
    'Firestore will be unavailable. Set these in your .env file or environment.'
  );
}

// Initialize our Firestore service wrapper if Firebase initialized
if (firebaseInitialized) {
  firestoreDb.init(getFirestore(firebaseAdmin.getApp()));
  console.log('[Firestore] Database service ready.');

  // Initialize Cloud Storage with the same service account credentials
  cloudStorage.init({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: firebasePrivateKey,
  });
  console.log('[GCS] Cloud Storage service ready.');

  // -----------------------------------------------------------------------
  // Warm-up: Fire a dummy query to pre-fetch the OAuth2 access token.
  // Without this, the first real request incurs an extra ~1-2s delay while
  // the Admin SDK fetches its token from Google's auth server.
  // -----------------------------------------------------------------------
  firestoreDb.findAll('cases').catch(() => {});
  console.log('[Firestore] Token pre-warmed.');
}

// ---------------------------------------------------------------------------
// Express App Setup
// ---------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configure CORS for production and development
const corsOptions = {
  origin: true, // Allow all origins (Cloud Run will handle different origins)
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Wolfpack DNA API',
    endpoints: ['/api/health', '/api/cases', '/api/team', '/api/inquiries', '/api/images'],
  });
});

// Routes
app.use('/api/cases', caseRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firestore: firebaseInitialized ? 'connected' : 'disconnected (check credentials)',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Wolfpack DNA Admin API running on port ${PORT}`);

  // -----------------------------------------------------------------------
  // Keep-alive: periodically query the database to prevent cold starts on
  // hosting platforms that spin down idle instances (e.g. Render, Railway).
  // This keeps the Firestore connection and OAuth2 token warm.
  // -----------------------------------------------------------------------
  const KEEP_ALIVE_INTERVAL_MS = 30 * 1000; // 2 minutes
  const keepAlive = async () => {
    try {
      // Query both collections to keep them warm
      await Promise.all([
        firestoreDb.findAll('cases').then(() => {
          console.log('[KeepAlive] Cases collection queried successfully');
        }),
        firestoreDb.findAllOrdered('team').then(() => {
          console.log('[KeepAlive] Team collection queried successfully');
        }),
      ]);
      console.log(`[KeepAlive] All collections warmed at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('[KeepAlive] Warm-up failed:', err.message);
    }
  };

  // Initial warm-up on startup
  keepAlive();

  // Periodic warm-up
  setInterval(keepAlive, KEEP_ALIVE_INTERVAL_MS);

  console.log(`[KeepAlive] Will warm database every ${KEEP_ALIVE_INTERVAL_MS / 1000}s to prevent cold starts.`);
});
