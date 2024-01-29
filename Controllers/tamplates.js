// const Patients = require("../Models/patientsModels");
const tamplate = require("../Models/tamplate");
const prescription = require("../Models/prescription");
const medcinesModel = require("../Models/medcinesModel");
const dosageModel = require("../Models/dosageModel");
const { ObjectId } = require("mongoose").Types;

const addtamplate = async (req, res) => {
  let Data = req.body.data;
  let DisName = req.body.DisName;
  let description = req.body.description;
  description.trim();
  let tampName_ = await tamplate.findOne({
    userid: req.user.user._id,
    description: description,
  });
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
  console.log({ newArray, msg: "-----tamplate-----" });

  if (tampName_) {
    if (!DisName.trim()) {
      return res.send({ status: "404", msg: "Require DisName" });
    } else {
      if (!description.trim()) {
        return res.send({ status: "404", msg: "Require Tamplate Name" });
      } else {
        let data_ = {
          userid: req.user.user._id,
          DisName,
          description,
          medcinesid: newArray,
        };
        let result = await tamplate.findOneAndUpdate(
          { description: description, userid: req.user.user._id },
          {
            $set: data_,
          },
          {
            new: true,
          }
        );

        if (result) {
          // console.log(result);
          return res.send({
            status: "200",
            msg: "Tamplate Updated Successfully !",
          });
        }
      }
    }
  } else {
    if (!DisName.trim()) {
      return res.send({ status: "404", msg: "Require DisName" });
    } else {
      if (!description.trim()) {
        return res.send({ status: "404", msg: "Require Tamplate Name" });
      } else {
        let data_ = {
          userid: req.user.user._id,
          DisName,
          description,
          medcinesid: newArray,
        };
        let res_ = await tamplate.create(data_);
        if (res_) {
          return res.send({ status: "200", msg: "Save Successfully !" });
        }
      }
    }
  }
};
const getAllTamplates = async (req, res) => {
  let userid = req.user.user._id;
  let result = await tamplate.aggregate([
    {
      $match: {
        userid: new ObjectId(userid),
        // userid: userid,
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
  ]);
  console.log({ result });
  let mydata = result.map((val, i) => {
    let data = {
      _id: result[i]._id,
      userid: result[i].userid,
      DisName: result[i].DisName,
      description: result[i].description,
      createdAt: result[i].createdAt,
      updatedAt: result[i].updatedAt,
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

  console.log({ mydata });

  if (result) {
    res.send({ status: "200", data: mydata });
  }
};

const search = async (req, res) => {
  let key = req.params.key;

  let result = await tamplate.find({
    userid: req.user.user._id,
    $or: [{ DisName: { $regex: key } }],
  });
  if (result) {
    res.send({ status: "200", data: result });
  }
};
const deleteTamplates = async (req, res) => {
  let id = req.params.id;
  let result = await tamplate.findByIdAndDelete({
    _id: id,
    userid: req.user.user._id,
  });
  if (result) {
    res.send({ status: "200", msg: "Deleted Successfully" });
  }
};
const asignTamplate = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  let DisName = body.tamp_data.DisName;
  let medcinesid = body.tamp_data.medcinesid;
  let Dosageid = body.tamp_data.Dosageid;
  let comments = body.tamp_data.comments;
  if (DisName) {
    let prescription_ = {
      pid: id,
      userid: req.user.user._id,
      DisName,
      medcinesid,
      Dosageid,
      comments,
    };
    // console.log(prescription_);
    let pres = await prescription.create(prescription_);
    pres.save();
    if (pres) {
      res.send({ status: "200", msg: "Save Asign Tamplate!" });
    }
  }
};
const getAllDisName = async (req, res) => {
  console.log("MEDCINES");
  // { userid: req.user.user._id }
  let data = await medcinesModel.find();
  let result = await dosageModel.aggregate([
    {
      $lookup: {
        from: "medcines", // The name of the referenced collection
        localField: "mid",
        foreignField: "_id",
        as: "Medcines",
      },
    },
   
  ]);

  let mydata={data,result}
  if (data) {
    return res.send({ status: "200", data: mydata });
  }
};

const UpdateTamp = async (req, res) => {
  let data = req.body.data;
  let id = req.params.id;
  let DisName = req.body.DisName;
  console.log(req.body);
  if (!DisName) {
    res.send({ status: "200", msg: "Require DisName" });
  } else {
    let data_ = {
      DisName,
      medcinesid:newArray,
    };
    let result = await tamplate.findByIdAndUpdate(
      { _id: id, userid: req.user.user._id },
      {
        $set: data_,
      },
      {
        new: true,
      }
    );

    if (result) {
      console.log(result);
      return res.send({ status: "200", msg: "Save updated Tamplate !" });
    }
  }
};

module.exports = {
  addtamplate,
  getAllTamplates,
  search,
  deleteTamplates,
  asignTamplate,
  getAllDisName,
  UpdateTamp,
};
