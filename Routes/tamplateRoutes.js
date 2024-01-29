const express = require("express");
const router = express.Router();
const tamplateControllers = require("../Controllers/tamplates");
const auth = require("../Middleware/userAuthentication");

router.post("/add/tamplate", auth, tamplateControllers.addtamplate);
router.get("/get/tamplate", auth, tamplateControllers.getAllTamplates);
router.get("/search/tamplate/:key", auth, tamplateControllers.search);
router.delete(
  "/delete/tamplate/:id",
  auth,
  tamplateControllers.deleteTamplates
);


router.post("/asign/tamplate/:id", auth, tamplateControllers.asignTamplate);
router.get("/getAllDisName", auth, tamplateControllers.getAllDisName);
router.put("/update/tamp/:id", auth, tamplateControllers.UpdateTamp);

module.exports = router;
