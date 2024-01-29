const express = require("express");
const router = express.Router();
const prescriptionControllers = require("../Controllers/prescriptionControllers");
const auth = require("../Middleware/userAuthentication");

router.post(
  "/add/prescription/:id",
  auth,
  prescriptionControllers.addPrescription
);
router.get("/add/get/:id", auth, prescriptionControllers.getPrescription);
router.get("/add/getall", auth, prescriptionControllers.All_prescription);
// /api/get/public/prescription/
router.get("/add/getall", auth, prescriptionControllers.All_prescription);
router.post("/get/public/prescription",prescriptionControllers.getPublicPrescription);
router.delete(
  "/pres/delete/:id",
  auth,
  prescriptionControllers.deletePrescription
);
router.put(
  "/pres/update/:id",
  auth,
  prescriptionControllers.UpdatePrescription
);

module.exports = router;
