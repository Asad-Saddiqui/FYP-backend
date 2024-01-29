const mongoose = require("mongoose");
const { Schema } = mongoose;
const PatientsSchema = new Schema(
  {
    userid: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    pin: {
      type: String,
    },

    age: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Patients = new mongoose.model("Patients", PatientsSchema);
module.exports = Patients;
