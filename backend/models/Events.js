const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      default: "",
    },

    reminder: {
      type: String,
      default: "10min",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);