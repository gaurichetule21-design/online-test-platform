// routes/resultRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getResult, getMyResults } = require("../controller/resultController");

router.get("/my", protect, authorize("student"), getMyResults);
router.get("/:id", protect, getResult);

module.exports = router;