require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const path = require("path");

const authMiddleware = require("./middleware/auth");
const syncDrive = require("./services/driveSyncService");

const app = express();

// =====================
// Middlewares
// =====================

app.use(cors()); // نسيبه دلوقتي عشان ما نكسرش حاجة

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// =====================
// API Routes
// =====================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/search", require("./routes/search"));
app.use("/api/pdf", require("./routes/pdf"));

const adminOnly = require("./middleware/adminOnly");

app.use(
  "/api/admin",
  authMiddleware,
  adminOnly,
  require("./routes/admin")
);

// =====================
// Health Route
// =====================

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// =====================
// Serve Flutter Web (لو موجود)
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
// Auto Sync
// =====================

cron.schedule("0 * * * *", async () => {
  console.log("🔄 Auto Sync Running...");
  await syncDrive(process.env.DRIVE_FOLDER_ID);
});