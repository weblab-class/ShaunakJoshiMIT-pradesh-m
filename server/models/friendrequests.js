const mongoose = require("mongoose");

const User = require("./user");

const RequestSchema = new mongoose.Schema({
    _id: String,
    from: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    to: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    date: {type: Number, default: Date.now()}
});


module.exports = mongoose.model("request", RequestSchema);
