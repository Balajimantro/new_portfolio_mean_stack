const router = require("express").Router();
const getAllDataController = require("../controller/getAllData.controller");

router.get("/getAllPortfolioData", getAllDataController.getAllData);
router.get("/cv", getAllDataController.streamCv);

module.exports = router
