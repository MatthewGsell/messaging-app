const mongoose = require("mongoose");
const crypto = require("crypto");

const serverSchema = mongoose.Schema({
  name: { type: String, required: true },
  users: { type: Array, required: true },
  channels: {
    type: Array,
    required: true,
    default: [{ name: "general-text", messages: [], id: crypto.randomUUID() }],
  },
  voice_channels: {
    type: Array,
    required: true,
    default: [{ name: "general-video", id: crypto.randomUUID() }],
  },
  owner: { type: String, required: true },
});

module.exports = mongoose.model("Server", serverSchema);
