const user = require("../Models/user");
const jwt = require("jsonwebtoken");
const login = async (req, res) => {
  let { email, password } = req.body;
  console.log({ email, password });
  if (!email.trim() || !password.trim()) {
    return res.send({ status: "404", msg: "Please Fill  All Fileds" });
  }
  let result = await user.findOne({ email, password });
  if (!result || result.password !== password) {
    return res.send({ status: "404", msg: "Authentication failed" });
  }
  const token = jwt.sign({ user: result }, "asad1234", { expiresIn: "3h" });
  if (token) {
    return res.send({ status: "200", token: token, data: result });
  }
};
const signup = async (req, res) => {
  let { email, password, username } = req.body;
  console.log({ email, password, username });
  if ((!email.trim() || !password.trim(), !username.trim())) {
    return res.send({ status: "404", msg: "Please Fill  All Fileds" });
  }
  let result = await user.findOne({ email });
  if (result) {
    return res.send({ status: "404", msg: "Email Already Exist" });
  } else {
    let result = await user.create({ email, password, username });
    result.save();
    const token = jwt.sign({ user: result }, "asad1234", { expiresIn: "3h" });
    if (token) {
      return res.send({ status: "200", token: token, data: result });
    }
  }
};

module.exports = {
  login,
  signup,
};
