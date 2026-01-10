import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const clientDir = dev ? path.resolve(__dirname, '../client') : path.resolve(__dirname, './client');
const nextApp = next({ dev, dir: clientDir });
const nextHandler = nextApp.getRequestHandler();

async function createServer() {
  await nextApp.prepare();
  const app = express();

  // Connect to all MongoDB databases
  connectAllDatabases();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
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
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
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
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-super-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

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
  app.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  return app;
}

export default createServer;
