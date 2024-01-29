const mongoose = require("mongoose");
const { Schema } = mongoose;
const dosageSchema = new Schema(
  {
    mid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medcines", // The name of the referenced model (Doctor)
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // The name of the referenced model (Doctor)
    },
    Dosage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const dosage = new mongoose.model("dosages", dosageSchema);
module.exports = dosage;
