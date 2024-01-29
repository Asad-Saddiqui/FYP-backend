const mongoose = require("mongoose");
const { Schema } = mongoose;
const TamplateSchema = new Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // The name of the referenced model (Doctor)
    },
    DisName: {
      type: String,
    },
    description: {
      type: String,
    },
    medcinesid: [
      {
        mid: { type: Schema.Types.ObjectId, ref: "medcines" },
        Dosage: { type: Schema.Types.ObjectId, ref: "dosages" },
        comment: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Tamplate = new mongoose.model("tamplate", TamplateSchema);
module.exports = Tamplate;
