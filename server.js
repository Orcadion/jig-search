require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const path = require("path");

const authMiddleware = require("./middleware/auth");
const adminOnly = require("./middleware/adminOnly");
const syncDrive = require("./services/driveSyncService");

const app = express();

// =====================
// Basic Middlewares
// =====================

app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json());

// =====================
// Health Route (قبل أي rate limit)
// =====================

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// =====================
// Rate Limiter (API only)
// =====================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

// نطبقه بس على /api
app.use("/api", apiLimiter);

// =====================
// API Routes
// =====================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/search", require("./routes/search"));
app.use("/api/pdf", require("./routes/pdf"));

app.use(
  "/api/admin",
  authMiddleware,
  adminOnly,
  require("./routes/admin")
);

// =====================
// Serve Flutter Web
// =====================

const buildPath = path.join(__dirname, "build/web");

app.use(express.static(buildPath));

// fallback آمن
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(buildPath, "index.html"));
  } else {
    next();
  }
});

// =====================
// Start Server
// =====================

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup Error:", err);
  }
}

startServer();

// =====================
// Auto Sync (كل ساعة)
// =====================

cron.schedule("0 * * * *", async () => {
  console.log("🔄 Auto Sync Running...");
  await syncDrive(process.env.DRIVE_FOLDER_ID);
});