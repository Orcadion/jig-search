const express = require("express");
const router = express.Router();

const drive = require("../config/google");
const { PDFDocument, rgb, degrees } = require("pdf-lib");

router.get("/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const driveResponse = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true,
      },
      { responseType: "arraybuffer" }
    );

    const pdfDoc = await PDFDocument.load(driveResponse.data);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      page.drawText("JIG SEARCH CONFIDENTIAL", {
        x: 150,
        y: 300,
        size: 40,
        color: rgb(0.7, 0.7, 0.7),
        rotate: degrees(45),
        opacity: 0.2,
      });
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBytes.length);
    res.setHeader("Cache-Control", "no-store");
res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ message: "Failed to load PDF" });
  }
});

module.exports = router;