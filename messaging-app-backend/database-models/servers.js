const mongoose = require("mongoose");

const serverSchema = mongoose.Schema({
  name: { type: String, required: true },
  users: { type: Array, required: true },
  channels: { type: Array, required: true, default: [] },
  voice_channels: { type: Array, required: true, default: [] },
  owner: {type: String, required: true}
});

module.exports = mongoose.model("Server", serverSchema);
