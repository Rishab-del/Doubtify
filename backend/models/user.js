const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
    },

    exam: {
      type: String,
      default: "",
    },

    className: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    lastActiveDate: {
      type: Date,
      default: null,
    },

    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);