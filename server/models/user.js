const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  friends: Array,
  nickname: { type: String, default: null, unique: true},
});

module.exports = mongoose.model("user", UserSchema);