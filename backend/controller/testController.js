// controller/testController.js
const Test = require("../models/Test");
const Question = require("../models/Question");
const Result = require("../models/Result");

// POST /api/tests  (instructor)
// Accepts the whole test in one payload, including its questions, e.g.:
// { title, description, duration, status, questions: [{ type, text, options, correctIndex, expected }] }
async function createTest(req, res, next) {
  try {
    const { title, description, duration, status, questions } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const test = await Test.create({
      ownerId: req.user.id,
      title,
      description,
      durationMinutes: Number(duration) || 20,
      status: status === "published" ? "published" : "draft",
    });

    if (Array.isArray(questions) && questions.length) {
      await Question.bulkCreate(test.id, questions);
    }

    res.status(201).json(test);
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/mine  (instructor) — shaped to match the dashboard cards directly
async function getMyTests(req, res, next) {
  try {
    const tests = await Test.findByOwnerWithStats(req.user.id);
    res.json(
      tests.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        questions: Number(t.questions),
        attempts: Number(t.attempts),
        avgScore: t.avg_score === null ? null : Number(t.avg_score),
      }))
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/available  (student)
async function getAvailableTests(req, res, next) {
  try {
    const tests = await Test.findPublished();
    res.json(
      tests.map((t) => ({
        id: t.id,
        title: t.title,
        questions: Number(t.questions),
        duration: t.duration_minutes,
        code: t.access_code,
      }))
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/:id/attempt — correct answers are stripped before this goes out
async function getTestForAttempt(req, res, next) {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const questions = await Question.findByTestId(test.id);
    res.json({
      id: test.id,
      title: test.title,
      durationMinutes: test.duration_minutes,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.question_text,
        options: q.options || undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/:id/results  (instructor, owner only) — every attempt on this test
async function getTestResults(req, res, next) {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    if (test.owner_id !== req.user.id) {
      return res.status(403).json({ message: "You don't own this test" });
    }

    const results = await Result.findByTest(test.id);
    res.json(
      results.map((r) => ({
        id: r.id,
        student: r.student_name,
        score: r.score,
        total: r.total,
        date: r.submitted_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { createTest, getMyTests, getAvailableTests, getTestForAttempt, getTestResults };