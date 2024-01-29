const mongoose = require("mongoose");
const { Schema } = mongoose;
const TamplateSchema = new Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const user = new mongoose.model("user", TamplateSchema);
module.exports = user;
