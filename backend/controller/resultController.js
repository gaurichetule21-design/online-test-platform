// controller/resultController.js
const Question = require("../models/Question");
const Test = require("../models/Test");
const Result = require("../models/Result");

// --- grading helpers -------------------------------------------------

function grade(question, givenAnswer) {
  if (givenAnswer === undefined || givenAnswer === null || givenAnswer === "") {
    return "skipped";
  }
  if (question.type === "short") {
    const given = String(givenAnswer).trim().toLowerCase();
    const expected = String(question.correct_answer).trim().toLowerCase();
    return given === expected ? "correct" : "incorrect";
  }
  // mcq / truefalse — both store the correct option index as text
  return String(givenAnswer) === String(question.correct_answer) ? "correct" : "incorrect";
}

function displayAnswer(question, value) {
  if (value === undefined || value === null || value === "") return "—";
  if (question.type === "mcq") return question.options[value];
  if (question.type === "truefalse") return ["True", "False"][value];
  return value; // short answer is already a string
}

// --- handlers ----------------------------------------------------------

// POST /api/tests/:id/submit  (student)
// body: { answers: { [questionId]: answerGiven }, timeTakenSeconds }
async function submitAttempt(req, res, next) {
  try {
    const testId = req.params.id;
    const { answers = {}, timeTakenSeconds } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const questions = await Question.findByTestId(testId);

    let score = 0;
    const breakdown = questions.map((q) => {
      const given = answers[q.id];
      const state = grade(q, given);
      if (state === "correct") score++;

      return {
        text: q.question_text,
        your: displayAnswer(q, given),
        correct: q.type === "short" ? q.correct_answer : displayAnswer(q, Number(q.correct_answer)),
        state,
      };
    });

    const result = await Result.create({
      testId,
      userId: req.user.id,
      score,
      total: questions.length,
      timeTakenSeconds,
      answers,
      breakdown,
    });

    res.status(201).json({ attemptId: result.id });
  } catch (err) {
    next(err);
  }
}

// GET /api/results/:id  (the student who took it, or the test's owner)
async function getResult(req, res, next) {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    const isOwner = result.user_id === req.user.id;
    const isTestOwner = result.test_owner_id === req.user.id;
    if (!isOwner && !isTestOwner) {
      return res.status(403).json({ message: "You can't view this result" });
    }

    let timeTaken = "—";
    if (result.time_taken_seconds != null) {
      const m = Math.floor(result.time_taken_seconds / 60).toString().padStart(2, "0");
      const s = (result.time_taken_seconds % 60).toString().padStart(2, "0");
      timeTaken = `${m}:${s}`;
    }

    res.json({
      title: result.test_title,
      score: result.score,
      total: result.total,
      timeTaken,
      breakdown: result.breakdown,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/results/my  (student)
async function getMyResults(req, res, next) {
  try {
    const results = await Result.findByUser(req.user.id);
    res.json(
      results.map((r) => ({
        id: r.id,
        title: r.title,
        score: r.score,
        total: r.total,
        date: r.submitted_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAttempt, getResult, getMyResults };