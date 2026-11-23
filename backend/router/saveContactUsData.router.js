const router = require("express").Router();
const saveContactUsDataController = require("../controller/saveContactUsData.controller");
const { validate } = require("../middleware/validate.middleware");
const { contactSchema } = require("../validators/schemas");

router.post("/saveContactForm", validate(contactSchema), saveContactUsDataController.saveContactUsData);

module.exports = router;
