const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    userId: String,

    question: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Doubt",
  doubtSchema
);