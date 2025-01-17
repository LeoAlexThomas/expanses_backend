const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please give user name"],
    },
    email: {
      type: String,
      required: [true, "Please give user email"],
      unique: [true, "This Email Address is already in use"],
    },
    password: {
      type: String,
      required: [true, "Please give user password"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
