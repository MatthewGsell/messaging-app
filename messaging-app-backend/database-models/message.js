const mongoose = require("mongoose");

const directMessageSchema = mongoose.Schema({
  users: { type: Array, required: true },
  messages: { type: Array, required: true },
});

module.exports = mongoose.model("Directmessage", directMessageSchema);
