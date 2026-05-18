const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({

  emoji: String,
  user: String,

});

const discussionSchema = new mongoose.Schema({

  text: {
    type: String,
    required: true,
  },

  user: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    default:
      "https://i.pravatar.cc/150",
  },

  room: {
    type: String,
    default: "general",
  },

  time: String,

  typing: {
    type: Boolean,
    default: false,
  },

  seenBy: [
    {
      type: String,
    },
  ],

  reactions: [reactionSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model(
  "Discussion",
  discussionSchema
);