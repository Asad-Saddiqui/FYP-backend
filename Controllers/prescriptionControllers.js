const prescription = require("../Models/prescription");
const patientsModels = require("../Models/patientsModels");
const user = require("../Models/user");
const medcinesModel = require("../Models/medcinesModel");
const dosageModel = require("../Models/dosageModel");
const { ObjectId } = require("mongoose").Types;
const mongoose = require("mongoose");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const http = require("http");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const sendEmail = (data) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("output.pdf"));
  doc.text("Hello, this is a PDF generated using Node.js.");

  // End the document
  doc.end();
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
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prescription</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }

        h1 {
            text-align: center;
        }

        .section {
            margin-bottom: 20px;
        }

        .section h2 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .section p {
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Prescription</h1>
        <div class="section">
            <h2>Patient Information:</h2>
            <p>Name: ${data.Patient[0].name}</p>
            <p>Age: ${data.Patient[0].age}</p>
            <p>Gender: ${data.Patient[0].gender}</p>
        </div>
        <div class="section">
            <h2>Doctor Information:</h2>
            <p>Name: ${data.User[0].username}</p>
            <p>Email: ${data.User[0].email}</p>
        </div>
        <div class="section">
            <h2>Disease Related Information :</h2>
            <p>${data.DisName}</p>
        </div>
        <div class="section">
            <h2>Medicines:</h2>
            ${data.medcinesid.map((value, index) => {
              return `<p> ${index + 1}. ${value.Medicines} - Dosage: ${
                value.Dosage
              }, ${value.comment}</p>`;
            })}
           
        </div>
        <div class="section">
            <h2>Additional Notes:</h2>
            <p>Take medications with food. Follow up in two weeks.</p>
        </div>
    </div>
</body>
</html>

    `,
    // attachments: [
    //   {
    //     filename: 'document.pdf', // Name of the attached file
    //     path: 'output.pdf', // Path to the generated PDF
    //   },
    // ],
  };
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      // // // // console.log("Email sent:", info.response);
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
const getPublicPrescription = async (req, res) => {
  console.log("PUBLIC PRESCRIPTION");
  let { email, PID } = req.body;
  if (email.trim() && PID.trim()) {
    let patients_ = await patientsModels.findOne({ email, pin: PID });
    if (patients_) {
      // // // // console.log({ patients_ });
      const objectId = patients_._id;
      const pid = objectId.toString();
      const userid = patients_.userid;
      let result = await prescription.aggregate([
        {
          $match: {
            pid: new ObjectId(pid),
            userid: new ObjectId(userid),
          },
        },
        {
          $lookup: {
            from: "patients", // The name of the referenced collection
            localField: "pid",
            foreignField: "_id",
            as: "Patient",
          },
        },
        {
          $lookup: {
            from: "users", // The name of the referenced collection
            localField: "userid",
            foreignField: "_id",
            as: "User",
          },
        },
        {
          $lookup: {
            from: "medcines", // The name of the referenced collection
            localField: "medcinesid._id",
            foreignField: "_id",
            as: "Medcines",
          },
        },
        {
          $lookup: {
            from: "dosages", // The name of the referenced collection
            localField: "medcinesid.Dosage",
            foreignField: "_id",
            as: "Dosage",
          },
        },
        {
          $project: {
            "User.password": 0, // Exclude the "password" field from the "User" array
          },
        },
      ]);
      console.log({ result });
      let mydata = result.map((val, i) => {
        let data = {
          _id: result[i]._id,
          userid: result[i].userid,
          DisName: result[i].DisName,
          // description: result[i].description,
          createdAt: result[i].createdAt,
          updatedAt: result[i].updatedAt,
          User: result[i].User,
          Patient: result[i].Patient,
          __v: 0,
        };
        let medcinesid_ = result[i].medcinesid;
        medcinesid_ = medcinesid_.map((item) => ({
          _id: item._id.toString(),
          Dosage: item.Dosage.toString(),
          comment: item.comment,
        }));
        let medcinesid = result[i].Medcines;
        medcinesid = medcinesid.map((item) => ({
          _id: item._id.toString(),
          medcines: item.medcines,
        }));
        let Dosageid = result[i].Dosage;
        Dosageid = Dosageid.map((item) => ({
          _id: item._id.toString(),
          mid: item.mid.toString(),
          Dosage: item.Dosage,
        }));
        let Comments = medcinesid_;
        let Medcines = medcinesid;
        let Dosage = Dosageid;

        // Create a new array combining comments, dosage, and medicines
        const newArray = Comments.map((comment) => {
          const medicine = Medcines.find((med) => med._id === comment._id);
          const dosage = Dosage.find((dos) => dos._id === comment.Dosage);

          return {
            comment: comment.comment,
            Dosage: dosage.Dosage,
            Medicines: medicine.medcines,
          };
        });

        let medcinesid1 = [];
        let Dosageid1 = [];
        let comments1 = [];
        newArray.map((val) => {
          medcinesid1.push(val.Medicines);
          Dosageid1.push(val.Dosage);
          comments1.push(val.comment);
        });
        data.medcinesid = medcinesid1;
        data.Dosageid = Dosageid1;
        data.comments = comments1;
        return data;
      });
      console.log(
        "Data========================================================================",
        mydata
      );
      if (result) {
        return res.send({ status: "200", data: mydata });
      } else {
        // // // // console.log("No Record");
        return res.send({ status: "404", msg: "No Record" });
      }
    } else {
      // // // // console.log("no Record");
      return res.send({ status: "404", msg: "No Record Found" });
    }
  }
};

const addPrescription = async (req, res) => {
  let Data = req.body.data;
  let DisName_ = req.body.DisName;
  let id = req.params.id;
  const addDataBase = async (modal, value_, c_name) => {
    let id_array = [];
    let id_comments = [];
    const itemArray = Data.map((obj) => {
      if (value_ === "medcine") {
        id_comments.push({ med: obj.medcine, comment: obj.comment });
        return obj.medcine;
      }
    });
    let Exist_Values;
    if (c_name === "medcines") {
      Exist_Values = await modal.find({
        medcines: { $in: itemArray },
      });
    }
    for (let index = 0; index < Exist_Values.length; index++) {
      if (c_name === "medcines") {
        id_array.push({
          id: Exist_Values[index]._id,
          name: Exist_Values[index].medcines,
        });
      }
    }
    const Exist_Values_name = new Set(
      Exist_Values.map((keys) => {
        if (c_name === "medcines") {
          return keys.medcines;
        }
      })
    );
    let missingValues = itemArray.filter(
      (keys) => !Exist_Values_name.has(keys)
    );
    const missingValues__ = new Set(missingValues);
    missingValues = Array.from(missingValues__);
    if (missingValues.length > 0) {
      const newValues = missingValues.map((keys) => {
        if (c_name === "medcines") {
          return { medcines: keys };
        }
      });

      let newValues_ = await modal.insertMany(newValues);
      for (let index = 0; index < newValues_.length; index++) {
        if (c_name === "medcines") {
          id_array.push({
            id: newValues_[index]._id,
            name: newValues_[index].medcines,
          });
        }
      }
    }
    const newArray = id_array.map((item) => ({
      id: item.id,
      name: item.name,
      comment:
        id_comments.find((commentItem) => commentItem.med === item.name)
          ?.comment || "",
    }));
    return newArray;
  };
  let dosageArray = [];

  const addDataBase2 = async (modal, value_, c_name, ids) => {
    const Exist_Values = Data.map((obj, i) => {
      if (value_ === "dosage") {
        return {
          Dosage: obj.dosage,
          mid: ids[i].id,
          md: ids[i].name,
          comment: ids[i].comment,
        };
      }
    });
    if (c_name === "Dosage") {
      const findvalues = async (mid, dosage) => {
        const result = await modal.find({
          Dosage: dosage,
          mid: new ObjectId(mid),
        });
        if (result.length > 0) {
          return result;
        } else {
          return false;
        }
      };
      let dosagesExisits = await Promise.all(
        Exist_Values.map((val, i) => {
          let array_ = findvalues(val.mid, val.Dosage);
          return array_;
        })
      );

      let extra = [];
      let dosagesExisits__ = dosagesExisits.map((val, i) => {
        if (val !== false) {
          extra.push({
            mid: val[0].mid,
            dosageid: val[0]._id,
            comment: Exist_Values[i].comment,
          });
          dosageArray.push(val[0]);
        }
      });
      let existvalues_names = dosageArray.map((val, i) => {
        return { mid: val.mid, Dosage: val.Dosage };
      });
      let existvalues_names_ids = dosageArray.map((val, i) => {
        return { mid: val.mid, id: val._id };
      });
      const all = Exist_Values;
      const missing = existvalues_names;
      const missingmedcdosage = all.filter(
        (item, i) =>
          !missing.some(
            (missingItem) =>
              missingItem.Dosage === item.Dosage &&
              missingItem.mid.equals(item.mid)
          )
      );
      let missing_ids = [...existvalues_names_ids];
      if (missingmedcdosage.length > 0) {
        let newValues_ = await modal.insertMany(missingmedcdosage);
        for (let index = 0; index < newValues_.length; index++) {
          if (c_name === "Dosage") {
            missing_ids.push({
              id: newValues_[index]._id,
              mid: newValues_[index].mid,
            });
          }
        }
        return missing_ids;
      } else {
        return missing_ids;
      }
    }
  };

  let _medcines = await addDataBase(medcinesModel, "medcine", "medcines");
  let _Dosage = await addDataBase2(dosageModel, "dosage", "Dosage", _medcines);
  const newArraymed = _medcines.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    comment: item.comment,
  }));
  const newArraydosage = _Dosage.map((item) => ({
    id: item.id.toString(),
    mid: item.mid.toString(),
  }));
  const newArray = newArraymed.map((medicine) => {
    const dosageItem = newArraydosage.find(
      (dosage) => dosage.mid === medicine.id
    );

    return {
      id: medicine.id,
      Dosage: dosageItem ? dosageItem.id : null,
      comment: medicine.comment,
    };
  });

  if (DisName_.trim().length > 3) {
    let prescription_ = {
      pid: id,
      userid: req.user.user._id,
      DisName: DisName_,
      medcinesid: newArray,
    };
    let pres = await prescription.create(prescription_);
    pres.save();
    // console.log(pres);
    // console.log("added prescription");
    if (pres) {
      const objectId = pres._id;
      const _id = objectId.toString();
      const userid = pres.userid;
      let result = await prescription.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
            userid: new ObjectId(userid),
          },
        },
        {
          $lookup: {
            from: "patients", // The name of the referenced collection
            localField: "pid",
            foreignField: "_id",
            as: "Patient",
          },
        },
        {
          $lookup: {
            from: "users", // The name of the referenced collection
            localField: "userid",
            foreignField: "_id",
            as: "User",
          },
        },
        {
          $lookup: {
            from: "medcines", // The name of the referenced collection
            localField: "medcinesid._id",
            foreignField: "_id",
            as: "Medcines",
          },
        },
        {
          $lookup: {
            from: "dosages", // The name of the referenced collection
            localField: "medcinesid.Dosage",
            foreignField: "_id",
            as: "Dosage",
          },
        },
        {
          $project: {
            "User.password": 0, // Exclude the "password" field from the "User" array
          },
        },
      ]);

      let data = {
        _id: result[0]._id,
        userid: result[0].userid,
        pid: result[0].pid,
        DisName: result[0].DisName,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt,
        __v: 0,
        Patient: result[0].Patient,
        User: result[0].User,
      };
      let medcinesid_ = result[0].medcinesid;
      medcinesid_ = medcinesid_.map((item) => ({
        _id: item._id.toString(),
        Dosage: item.Dosage.toString(),
        comment: item.comment,
      }));
      let medcinesid = result[0].Medcines;
      medcinesid = medcinesid.map((item) => ({
        _id: item._id.toString(),
        medcines: item.medcines,
      }));
      let Dosageid = result[0].Dosage;
      Dosageid = Dosageid.map((item) => ({
        _id: item._id.toString(),
        mid: item.mid.toString(),
        Dosage: item.Dosage,
      }));
      let Comments = medcinesid_;
      let Medcines = medcinesid;
      let Dosage = Dosageid;

      // Create a new array combining comments, dosage, and medicines
      const newArray = Comments.map((comment) => {
        const medicine = Medcines.find((med) => med._id === comment._id);
        const dosage = Dosage.find((dos) => dos._id === comment.Dosage);

        return {
          comment: comment.comment,
          Dosage: dosage.Dosage,
          Medicines: medicine.medcines,
        };
      });
      data.medcinesid = newArray;
      console.log({ data: data.Patient[0] });
      // console.log(newArray);

      isInternetConnected((connected) => {
        if (connected) {
          sendEmail(data);
          return res.send({ status: "200", msg: "Save Successfully!" });
        } else {
          return res.send({
            status: "200",
            msg: "No Internet butt prescription save",
          });
        }
      });
    }
  } else {
    return res.send({
      status: "401",
      msg: "Enter Disease Related Information",
    });
  }

  //------------Add Dieases In Data Base End---------------------
};
const getPrescription = async (req, res) => {
  console.log("PRESCRIPTION");
  // const result = await prescription.find({
  //   pid: req.params.id,
  //   userid: req.user.user._id,
  // });
  // console.log(result)

  let result = await prescription.aggregate([
    {
      $match: {
        pid: new ObjectId(req.params.id),
        userid: new ObjectId(req.user.user._id),
      },
    },
    {
      $lookup: {
        from: "patients", // The name of the referenced collection
        localField: "pid",
        foreignField: "_id",
        as: "Patient",
      },
    },
    {
      $lookup: {
        from: "users", // The name of the referenced collection
        localField: "userid",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $lookup: {
        from: "medcines", // The name of the referenced collection
        localField: "medcinesid._id",
        foreignField: "_id",
        as: "Medcines",
      },
    },
    {
      $lookup: {
        from: "dosages", // The name of the referenced collection
        localField: "medcinesid.Dosage",
        foreignField: "_id",
        as: "Dosage",
      },
    },
    {
      $project: {
        "User.password": 0, // Exclude the "password" field from the "User" array
      },
      $project: {
        "Patient.pin": 0, // Exclude the "password" field from the "User" array
      },
    },
  ]);
  console.log(result);
  if (result) {
    // // // console.log({ msg:"get--------",result });
    // // // // console.log({ "get Data Kkk": "get Prescription" });
    res.send({ status: "200", data: result });

    // console.log({result})
    // // // // console.log('ok')
  }
};

const All_prescription = async (req, res) => {
  // //   // // // console.log("working...");
  // const data = await prescription
  //   .find()
  //   .populate("deasesid")
  //   .populate("medcinesid")
  //   .populate("Dosageid")
  // // .populate("Dosage");
  // res.send({ statue: "200", data });
  // // // // // console.log({ prescription: data });
};

const UpdatePrescription = async (req, res) => {
  console.log("UPDATE PRECSRIPTION");
  let id = req.params.id;
  let Data = req.body.data;
  let DisName = req.body.DisName;
  const addDataBase = async (modal, value_, c_name) => {
    let id_array = [];
    let id_comments = [];
    const itemArray = Data.map((obj) => {
      if (value_ === "medcine") {
        id_comments.push({ med: obj.medcine, comment: obj.comment });
        return obj.medcine;
      }
    });
    let Exist_Values;
    if (c_name === "medcines") {
      Exist_Values = await modal.find({
        medcines: { $in: itemArray },
      });
    }
    for (let index = 0; index < Exist_Values.length; index++) {
      if (c_name === "medcines") {
        id_array.push({
          id: Exist_Values[index]._id,
          name: Exist_Values[index].medcines,
        });
      }
    }
    const Exist_Values_name = new Set(
      Exist_Values.map((keys) => {
        if (c_name === "medcines") {
          return keys.medcines;
        }
      })
    );
    let missingValues = itemArray.filter(
      (keys) => !Exist_Values_name.has(keys)
    );
    const missingValues__ = new Set(missingValues);
    missingValues = Array.from(missingValues__);
    if (missingValues.length > 0) {
      const newValues = missingValues.map((keys) => {
        if (c_name === "medcines") {
          return { medcines: keys };
        }
      });

      let newValues_ = await modal.insertMany(newValues);
      for (let index = 0; index < newValues_.length; index++) {
        if (c_name === "medcines") {
          id_array.push({
            id: newValues_[index]._id,
            name: newValues_[index].medcines,
          });
        }
      }
    }
    const newArray = id_array.map((item) => ({
      id: item.id,
      name: item.name,
      comment:
        id_comments.find((commentItem) => commentItem.med === item.name)
          ?.comment || "",
    }));
    return newArray;
  };
  let dosageArray = [];
  const addDataBase2 = async (modal, value_, c_name, ids) => {
    const Exist_Values = Data.map((obj, i) => {
      if (value_ === "dosage") {
        return {
          Dosage: obj.dosage,
          mid: ids[i].id,
          md: ids[i].name,
          comment: ids[i].comment,
        };
      }
    });
    if (c_name === "Dosage") {
      const findvalues = async (mid, dosage) => {
        const result = await modal.find({
          Dosage: dosage,
          mid: new ObjectId(mid),
        });
        if (result.length > 0) {
          return result;
        } else {
          return false;
        }
      };
      let dosagesExisits = await Promise.all(
        Exist_Values.map((val, i) => {
          let array_ = findvalues(val.mid, val.Dosage);
          return array_;
        })
      );

      let extra = [];
      let dosagesExisits__ = dosagesExisits.map((val, i) => {
        if (val !== false) {
          extra.push({
            mid: val[0].mid,
            dosageid: val[0]._id,
            comment: Exist_Values[i].comment,
          });
          dosageArray.push(val[0]);
        }
      });
      let existvalues_names = dosageArray.map((val, i) => {
        return { mid: val.mid, Dosage: val.Dosage };
      });
      let existvalues_names_ids = dosageArray.map((val, i) => {
        return { mid: val.mid, id: val._id };
      });
      const all = Exist_Values;
      const missing = existvalues_names;
      const missingmedcdosage = all.filter(
        (item, i) =>
          !missing.some(
            (missingItem) =>
              missingItem.Dosage === item.Dosage &&
              missingItem.mid.equals(item.mid)
          )
      );
      let missing_ids = [...existvalues_names_ids];
      if (missingmedcdosage.length > 0) {
        let newValues_ = await modal.insertMany(missingmedcdosage);
        for (let index = 0; index < newValues_.length; index++) {
          if (c_name === "Dosage") {
            missing_ids.push({
              id: newValues_[index]._id,
              mid: newValues_[index].mid,
            });
          }
        }
        return missing_ids;
      } else {
        return missing_ids;
      }
    }
  };
  let _medcines = await addDataBase(medcinesModel, "medcine", "medcines");
  let _Dosage = await addDataBase2(dosageModel, "dosage", "Dosage", _medcines);
  const newArraymed = _medcines.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    comment: item.comment,
  }));
  const newArraydosage = _Dosage.map((item) => ({
    id: item.id.toString(),
    mid: item.mid.toString(),
  }));
  const newArray = newArraymed.map((medicine) => {
    const dosageItem = newArraydosage.find(
      (dosage) => dosage.mid === medicine.id
    );

    return {
      id: medicine.id,
      Dosage: dosageItem ? dosageItem.id : null,
      comment: medicine.comment,
    };
  });
  console.log(newArray);
  if (id.length > 4 && DisName.trim()) {
    let pres = {
      DisName,
      medcinesid: newArray,
    };

    let result = await prescription.findByIdAndUpdate(
      { _id: id, userid: req.user.user._id },

      {
        $set: pres,
      },
      {
        new: true,
      }
    );
    // // // // console.log({ result });
    res.send({ status: "200", msg: "Updated Successfully !" });
  } else {
    return res.send({ status: "404", msg: "Something is missing !" });
  }
};
const deletePrescription = async (req, res) => {
  const id = req.params.id;
  const result = await prescription.findByIdAndDelete({
    _id: id,
    userid: req.user.user._id,
  });
  if (result) {
    return res.send({ status: "200", msg: "deleted Succesfuly" });
  }
};
module.exports = {
  addPrescription,
  getPrescription,
  All_prescription,
  deletePrescription,
  UpdatePrescription,
  getPublicPrescription,
};
