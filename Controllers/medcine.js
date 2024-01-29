const medcinesModel = require("../Models/medcinesModel");
const jwt = require("jsonwebtoken");
const addmedcine = async (req, res) => {
  let medcines = req.body.data;
  let userid = req.user.user._id;
  let findmed = await medcinesModel.findOne({ medcines, userid });
  if (findmed) {
    return res.send({ status: "404", msg: "Already Exist" });
  }

  let result = await medcinesModel.create({ medcines, userid });
  result.save();
  if (result) {
    return res.send({ status: "200", msg: "Medcine Added Successfully" });
  } else {
    return res.send({ status: "404", msg: "Something went wrong" });
  }
};
const getmed = async (req, res) => {
  console.log("GET MEDCINES");
  let userid = req.user.user._id;
  let med = await medcinesModel.find({ userid });
  //   console.log({med})
  if (med) {
    res.send({ status: "200", data: med });
  }
};
const deletemed = async (req, res) => {
  console.log("DELETE MEDCINES");
  let userid = req.user.user._id;
  let id = req.params.id;
  let med = await medcinesModel.findByIdAndDelete({ userid, _id: id });
  //   console.log({med})
  if (med) {
    res.send({ status: "200", msg: "successfully Deleted" });
  }
};
const edit = async (req, res) => {
  console.log("EDIT MEDCINES");
  let userid = req.user.user._id;
  let id = req.params.id;
  let medcine = req.body.data;
  if (medcine.trim()) {
    let med = await medcinesModel.findByIdAndUpdate(
      { _id: id, userid: req.user.user._id },
      {
        $set: { medcines: medcine },
      },
      {
        new: true,
      }
    );
    //   console.log({med})
    if (med) {
      res.send({ status: "200", msg: "successfully Deleted" });
    }
  } else {
    res.send({ status: "404", msg: "Please update medcine name" });
  }
};

module.exports = {
  addmedcine,
  getmed,
  deletemed,
  edit,
};
