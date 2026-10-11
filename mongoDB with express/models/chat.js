const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    maxLength: 50,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  create_at: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.pre("save", function () {
  if (!this.created_at && this.create_at) {
    this.created_at = this.create_at;
  }
  if (!this.create_at && this.created_at) {
    this.create_at = this.created_at;
  }
});

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;
