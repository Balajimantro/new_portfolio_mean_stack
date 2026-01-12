const router = require("express").Router();
const saveContactUsDataController = require("../controller/saveContactUsData.controller")

router.post("/saveContactForm", saveContactUsDataController.saveContactUsData);

module.exports = router