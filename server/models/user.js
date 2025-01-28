const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  friends: Array,
  nickname: { type: String, default: null, unique: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", UserSchema);
