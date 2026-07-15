// routes/testRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createTest,
  getMyTests,
  getAvailableTests,
  getTestForAttempt,
  getTestResults,
} = require("../controller/testController");
const { submitAttempt } = require("../controller/resultController");

router.post("/", protect, authorize("instructor"), createTest);
router.get("/mine", protect, authorize("instructor"), getMyTests);
router.get("/available", protect, authorize("student"), getAvailableTests);
router.get("/:id/attempt", protect, getTestForAttempt);
router.post("/:id/submit", protect, authorize("student"), submitAttempt);
router.get("/:id/results", protect, authorize("instructor"), getTestResults);

module.exports = router;