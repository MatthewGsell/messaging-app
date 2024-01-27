const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  servers: { type: Array, required: true, default: [] },
  messages: { type: Array, required: true, default: [] },
  friends: { type: Array, required: true, default: [] },
});

module.exports = mongoose.model("User", userSchema);
