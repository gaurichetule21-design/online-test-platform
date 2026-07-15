// routes/questionRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTest,
} = require("../controller/questionController");

router.post("/", protect, authorize("instructor"), addQuestion);
router.put("/:id", protect, authorize("instructor"), updateQuestion);
router.delete("/:id", protect, authorize("instructor"), deleteQuestion);
router.get("/test/:testId", protect, authorize("instructor"), getQuestionsByTest);

module.exports = router;