const mongoose = require("mongoose");
const FileSchema = require("./File");

const SessionSchema = new mongoose.Schema({
  // user who created the session (used to identify the owner of 
  // the session so they could upload files to it)
  userId: {
    type: String,
    required: true,
  },
  files: [FileSchema],
  password: {
    type: String,
    required: false,
  },
  directory: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalSize: {
    type: Number,
    required: true,
    default: 0,
  },
  totalFiles: {
    type: Number,
    required: true,
    default: 0,
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("sessions", SessionSchema);
