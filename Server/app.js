import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import next from "next";
import "./config/passport.js";
import { connectAllDatabases } from "./config/databases.js";
import authRoutes from "./routes/auth.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import challengeRoutes from "./routes/challenges.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import avatarRoutes from "./routes/avatar.routes.js";
import footprintLogRoutes from "./routes/footprintlog.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import communityRoutes from "./routes/community.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import emailRoutes from "./routes/email.routes.js";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.routes.js";
import blockchainRouter from "./blockchain.js";
import blockchainApiRoutes from "./routes/blockchain.routes.js";
import siteconfigRoutes from "./routes/siteconfig.routes.js";
import { startBlockchainListeners } from './services/blockchain.listener.js';
import { syncHistoricalEvents } from './services/blockchain.sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const clientDir = dev ? path.resolve(__dirname, '../client') : path.resolve(__dirname, './client');
// Lazy initialize Next.js only when not in test mode to speed tests
const isTest = process.env.NODE_ENV === 'test';
let nextApp; let nextHandler;
if (!isTest) {
  nextApp = next({ dev, dir: clientDir });
  nextHandler = nextApp.getRequestHandler();
}

async function createServer() {
  const app = express();

  // Trust the reverse proxy (Azure App Service, nginx, etc.)
  // This is required for express-rate-limit to read the correct client IP
  // from X-Forwarded-For and avoids ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
  app.set('trust proxy', 1);

  // Health-check endpoint — registered first so it always responds
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ready', uptime: process.uptime() });
  });

  if (!isTest) {
    // Run Next.js prepare AND database connections IN PARALLEL
    // to cut startup time roughly in half
    await Promise.all([
      nextApp.prepare(),
      connectAllDatabases(),
    ]);
    // Start blockchain listeners (non-fatal if it fails)
    startBlockchainListeners();
    // Kick off historical sync (non-blocking)
    setTimeout(() => { syncHistoricalEvents(); }, 2000);
  }

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://js.razorpay.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
          frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "same-origin" },
    })
  );

  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://www.green-community.app",
        "https://green-community.app",
        "https://greencommunity-app.azurewebsites.net", // Unified Azure deployment
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-session-id"],
  };

  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Data sanitization
  app.use(mongoSanitize());

  // Session configuration
  // IMPORTANT: In production, SESSION_SECRET MUST be set in environment variables
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: SESSION_SECRET is not set in production environment!');
  }
  
  const sessionConfig = {
    secret: sessionSecret || (process.env.NODE_ENV !== 'production' ? 'dev-secret-key-not-for-production' : (() => { throw new Error('SESSION_SECRET is required in production'); })()),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  // Use MongoDB session store in production to avoid MemoryStore memory leaks
  if (process.env.MONGO_URI) {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: 'greencommunity-auth',
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 hours (matches cookie maxAge)
      autoRemove: 'native',
    });
  }

  app.use(session(sessionConfig));

  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/marketplace", marketplaceRoutes);
  app.use("/api/avatar", avatarRoutes);
  app.use("/api/footprintlog", footprintLogRoutes);
  app.use("/api/challenges", challengeRoutes);
  app.use("/api/groups", groupsRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/community", communityRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/email", emailRoutes);
  app.use('/api/blockchain', blockchainApiRoutes);
  app.use('/api/config', siteconfigRoutes);
  // Simple blockchain demo endpoints (non /api for clarity/tests)
  app.use('/blockchain', blockchainRouter);

  // Global error handler for API
  app.use("/api", (err, req, res, next) => {
    console.error(err.stack);
    const message = process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message;
    res.status(err.status || 500).json({
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // Handle all other requests with Next.js
  // IMPORTANT: We do NOT use app.all("*") here because Express middleware
  // (helmet, cors, etc.) can conflict with Next.js streaming responses,
  // causing "Response body object should not be disturbed or locked" errors.
  // Instead, we expose nextHandler so the HTTP server can route non-API
  // requests directly to Next.js, bypassing Express middleware entirely.
  if (!isTest) {
    app.nextHandler = nextHandler;
  } else {
    app.get('/', (req,res)=> res.json({status:'ok'}));
  }

  return app;
}

export default createServer;
