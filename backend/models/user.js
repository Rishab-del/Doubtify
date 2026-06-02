const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profilePic: {
  type: String,
  default: "",
},
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
  type: String,
  default: "",
},

city: {
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

    password: {
      type: String,
      required: true,
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