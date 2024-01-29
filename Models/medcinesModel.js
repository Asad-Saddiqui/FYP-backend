const mongoose = require("mongoose");
const { Schema } = mongoose;
const medcinesSchema = new Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // The name of the referenced model (Doctor)
    },
    medcines: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const medcines = new mongoose.model("medcines", medcinesSchema);
module.exports = medcines;
