const RegisterPatients = require("../Controllers/patientsControllers");
const userControllers = require("../Controllers/userControllers");
const express = require("express");
const router = express.Router();
const auth = require("../Middleware/userAuthentication");

router.post("/user/login", userControllers.login);
router.post("/user/signup", userControllers.signup);
router.post("/register", auth, RegisterPatients.registerPatients);
router.get("/getdata", auth, RegisterPatients.getDatapatients);
router.get("/search/:key",auth, RegisterPatients.search_patients);
router.put("/update/:id", auth, RegisterPatients.updatePatients);
router.delete("/delete/:id", auth, RegisterPatients.deletePatients);

module.exports = router;
