const Patients = require("../Models/patientsModels");
const Prescription = require("../Models/prescription");
const user = require("../Models/user");
const http = require("http");
const { ObjectId } = require("mongoose").Types;

const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const sendEmail = (email, pin) => {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "asadsaddiqui101@gmail.com",
        pass: "vyhvwvqtktdhckct",
      },
    })
  );
  const mailOptions = {
    from: "asadsaddiqui101@gmail.com",
    to: "harisharri48@example.com", // Recipient's email address
    subject: "PDF Attachment from Node.js",
    html: `<html>
  <body>
   <table style={width:"100%"}>
   <tr>
   <th>Email : </th>
   <th>${email}</th>
   </tr>
   <tr>
   <th>PID : </th>
   <th>${pin}</th>
   </tr>
   </table>
    <a href='http://localhost:3000/patientsData'>Check Your Prescriptions</a>
  </body>
</html>`,
  };
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
function isInternetConnected(callback) {
  http
    .get("http://www.google.com", (res) => {
      // If the request was successful, assume internet connectivity
      if (res.statusCode === 200) {
        callback(true);
      } else {
        callback(false);
      }
    })
    .on("error", () => {
      // An error occurred, which means no internet connectivity
      callback(false);
    });
}
const registerPatients = async (req, res) => {
  try {
    let user_ = req.user;
    // console.log({ user_ });
    const { name, age, gender, email } = req.body;

    if (!name || !age || !gender || !email) {
      return res.send({ statue: "404", msg: "fill data" });
    } else {
      let pat = await Patients.findOne({
        userid: req.user.user._id,
        name: name,
        email: email,
      });
      if (pat) {
        return res.send({ status: "404", msg: "Patients all ready Exist" });
      } else {
        console.log("hello");
        const timestamp = Date.now(); // Get the current timestamp in milliseconds
        const last5digit = timestamp.toString().slice(-5); // Extract the last six digits
        let pin = "";
        function extractOddChars(str) {
          let result = "";
          for (let i = 0; i < str.length; i++) {
            if (i % 2 === 0) {
              result += str[i];
            }
          }
          pin = result + last5digit;
        }
        extractOddChars(name);

        const patients = await Patients.create({
          name,
          email,
          age,
          gender,
          pin: pin.trim() ? pin.toUpperCase() : Date.now(),
          userid: req.user.user._id,
          address: req.body.address,
        });
        patients.save();
        isInternetConnected((connected) => {
          if (connected) {
            sendEmail(patients.email, patients.pin);
            return res.send({
              status: "200",
              msg: "Send Email, Registred Successfully !",
            });
          } else {
            return res.send({
              status: "200",
              msg: "Cannot send email  butt Patient Registerd",
            });
          }
        });
      }
    }
  } catch (error) {
    return res.send({ statue: "404", msg: "something went wrong" });
  }
};

const getDatapatients = async (req, res) => {
  try {
    const data = await Patients.find({ userid: req.user.user._id });
    res.send({ status: "200", data: data });
    // console.log({data})
  } catch (error) {
    res.send({ status: "404", msg: "Something Went Wrong" });
  }
};
const deletePatients = async (req, res) => {
  let id = req.params.id;
  let pres = await Prescription.deleteMany({
    userid: req.user.user._id,
    pid: id,
  });
  let result = await Patients.findByIdAndDelete({
    _id: id,
    userid: req.user.user._id,
  });
  return res.send({ status: "200", msg: "Deleted Successfully!" });
};
const search_patients = async (req, res) => {
  console.log("working");
  let key = req.params.key;
  let userid = req.user.user._id;
  console.log({ key });
  let result = await Patients.find({
    userid: userid,
    $or: [
      { name: { $regex: key } },
      { address: { $regex: key } },
      { age: { $regex: key } },
      { email: { $regex: key } },
      { gender: { $regex: key } },
    ],
  });
  res.send({ status: "200", data: result });
  console.log("working");
};
const updatePatients = async (req, res) => {
  console.log("EDIT PATIENTS");
  let { name, email, gender, age, address } = req.body.data;
  let id = req.params.id;
  let patients = await Patients.findOne({ email });
  if (patients) {
    const objectId = patients._id;
    const pid = objectId.toString();
    if (pid === id) {
      let data = { name, email, gender, age, address };
      let patients_ = await Patients.findByIdAndUpdate(
        { _id: id, userid: req.user.user._id },
        {
          $set: data,
        },
        {
          new: true,
        }
        
      );
      if (patients_) {
        // console.log(patients_);
        sendEmail(patients_.email, patients_.pin);

        res.send({ status: "200", msg: "Updated Successfully" });
      }
    } else {
      res.send({ status: "404", msg: "Email Ready Exist" });
    }
  } else {
    let data = { name, email, gender, age, address };
    let patients_ = await Patients.findByIdAndUpdate(
      { _id: id, userid: req.user.user._id },
      {
        $set: data,
      },
      {
        new: true,
      }
    );
    if (patients_) {
      sendEmail(patients_.email, patients_.pin);
      // console.log(patients_)
      res.send({ status: "200", msg: "Updated Successfully" });
    }
  }
};

module.exports = {
  registerPatients,
  getDatapatients,
  deletePatients,
  search_patients,
  updatePatients,
};
