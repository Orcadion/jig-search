const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileId: { type: String, unique: true },
  name: String,
  connectorNumber: { type: String, index: true },
  orderNumber: String,
  parentFolder: String,
  createdTime: Date,
});

module.exports = mongoose.model("File", fileSchema);