const { google } = require("googleapis");

if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("❌ GOOGLE_SERVICE_ACCOUNT is not set");
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
} catch (err) {
  throw new Error("❌ Invalid GOOGLE_SERVICE_ACCOUNT JSON");
}

// إصلاح private_key
if (serviceAccount.private_key) {
  serviceAccount.private_key =
    serviceAccount.private_key.replace(/\\n/g, "\n");
}

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

module.exports = drive;