const mongoose = require("mongoose");
const { Schema } = mongoose;
const PatientsSchema = new Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // The name of the referenced model (Doctor)
    },
    pid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients", // The name of the referenced model (Doctor)
    },
    DisName: {
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

const Patients = new mongoose.model("prescription", PatientsSchema);
module.exports = Patients;

// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const PatientsSchema = new Schema(
//   {
//     pid: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "patients",
//     },
//     deasesid: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "deases",
//     },
//     medcinesid: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "medcines",
//     },

//     Dosage: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "dosage",
//     },
//     comments: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const prescription = new mongoose.model("prescription", PatientsSchema);
// module.exports = prescription;
