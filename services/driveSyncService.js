const drive = require("../config/google");
const File = require("../models/File");

async function scanFolder(folderId) {
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType, parents, createdTime)",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const items = res.data.files;
    const bulkOps = [];

    for (const item of items) {
      // لو فولدر → ندخل فيه
      if (item.mimeType === "application/vnd.google-apps.folder") {
try {
  await scanFolder(item.id);
} catch (err) {
  console.error("❌ Folder scan error:", err.message);
}      }

      // لو PDF → نحضره للـ bulk
      if (item.mimeType === "application/pdf") {
        const cleanName = item.name.replace(".pdf", "");
        const parts = cleanName.split("-");

        const connector = parts[0] || "";
        const order = parts[1] || "";

        bulkOps.push({
          updateOne: {
            filter: { fileId: item.id },
            update: {
              fileId: item.id,
              name: item.name,
              connectorNumber: connector,
              orderNumber: order,
              parentFolder: folderId,
              createdTime: item.createdTime,
            },
            upsert: true,
          },
        });
      }
    }

    // تنفيذ bulk مرة واحدة بدل مئات العمليات
    if (bulkOps.length > 0) {
      await File.bulkWrite(bulkOps);
      console.log(`⚡ Synced ${bulkOps.length} files`);
    }

    pageToken = res.data.nextPageToken;
  } while (pageToken);
}

async function syncDrive(rootFolderId) {
  console.log("🔄 Starting Recursive Sync...");
  await scanFolder(rootFolderId);
  console.log("✅ Sync Completed");
}

module.exports = syncDrive;