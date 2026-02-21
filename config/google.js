const { google } = require("googleapis");

// نتأكد إن المتغير موجود
if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("❌ GOOGLE_SERVICE_ACCOUNT is not set in environment variables");
}

// نحول الـ JSON string لكائن
const serviceAccount = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT
);

// إصلاح مشكلة private_key في Render
serviceAccount.private_key =
  serviceAccount.private_key.replace(/\\n/g, "\n");

// إعداد المصادقة
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    "https://www.googleapis.com/auth/drive.readonly"
  ],
});

// إنشاء Drive instance
const drive = google.drive({
  version: "v3",
  auth,
});

module.exports = drive;