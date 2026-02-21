const express = require("express");
const router = express.Router();
const syncDrive = require("../services/driveSyncService");

// تشغيل Sync يدوي
router.post("/sync", async (req, res) => {
  res.json({ message: "Sync started in background..." });

  try {
    await syncDrive(process.env.DRIVE_FOLDER_ID);
    console.log("✅ Manual Sync Completed");
  } catch (err) {
    console.error("❌ Manual Sync Error:", err);
  }
});

module.exports = router;