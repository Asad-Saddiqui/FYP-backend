const mongoose = require("mongoose");
const { Schema } = mongoose;
const deasesSchema = new Schema(
  {
    deases: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const deases = new mongoose.model("deases", deasesSchema);
module.exports = deases;
