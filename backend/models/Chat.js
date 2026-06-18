const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    messages: [
      {
        sender: String,
        text: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Chat", chatSchema);