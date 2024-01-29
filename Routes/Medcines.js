const express = require("express");
const router = express.Router();
const auth = require("../Middleware/userAuthentication");
const medcine = require("../Controllers/medcine");

router.post("/add/medcine/", auth, medcine.addmedcine);
router.get("/get/medcine/", auth, medcine.getmed);
router.delete("/delete/medcine/:id", auth, medcine.deletemed);
router.put("/edit/medcine/:id", auth, medcine.edit);

module.exports = router;
