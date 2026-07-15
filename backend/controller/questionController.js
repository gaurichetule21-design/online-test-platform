// controller/questionController.js
const Question = require("../models/Question");
const Test = require("../models/Test");

// Shared guard: throws a 404/403-flavored error instead of returning
// a boolean, so every handler below can just `await` it and move on.
async function ownsTestOrFail(testId, userId) {
  const test = await Test.findById(testId);
  if (!test) {
    const err = new Error("Test not found");
    err.statusCode = 404;
    throw err;
  }
  if (test.owner_id !== userId) {
    const err = new Error("You don't own this test");
    err.statusCode = 403;
    throw err;
  }
  return test;
}

// POST /api/questions  (instructor) — add one question to an existing test
async function addQuestion(req, res, next) {
  try {
    const { testId, type, text, options, correctIndex, expected } = req.body;
    if (!testId || !type || !text) {
      return res.status(400).json({ message: "testId, type and text are required" });
    }
    await ownsTestOrFail(testId, req.user.id);

    const correctAnswer = type === "short" ? expected : String(correctIndex);
    const question = await Question.create({ testId, type, text, options, correctAnswer });
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
}

// PUT /api/questions/:id  (instructor)
async function updateQuestion(req, res, next) {
  try {
    const existing = await Question.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Question not found" });
    await ownsTestOrFail(existing.test_id, req.user.id);

    const { type, text, options, correctIndex, expected } = req.body;
    const correctAnswer =
      expected !== undefined ? expected : correctIndex !== undefined ? String(correctIndex) : undefined;

    const updated = await Question.update(req.params.id, { type, text, options, correctAnswer });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/questions/:id  (instructor)
async function deleteQuestion(req, res, next) {
  try {
    const existing = await Question.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Question not found" });
    await ownsTestOrFail(existing.test_id, req.user.id);

    await Question.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /api/questions/test/:testId  (instructor) — includes correct answers, for editing
async function getQuestionsByTest(req, res, next) {
  try {
    await ownsTestOrFail(req.params.testId, req.user.id);
    const questions = await Question.findByTestId(req.params.testId);
    res.json(questions);
  } catch (err) {
    next(err);
  }
}

module.exports = { addQuestion, updateQuestion, deleteQuestion, getQuestionsByTest };