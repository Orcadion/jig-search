const express = require("express");
const router = express.Router();
const File = require("../models/File");

router.get("/:query", async (req, res) => {
  try {
    const query = req.params.query.trim();

    if (!query) {
      return res.json([]);
    }

    const results = await File.find({
      name: { $regex: query, $options: "i" }, // 🔥 البحث في اسم الملف بالكامل
    })
      .limit(50) // يمنع تحميل آلاف النتائج مرة واحدة
      .select("name fileId createdTime");

    res.json(results);

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;