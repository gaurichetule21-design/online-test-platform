// models/Result.js
const pool = require("../config/db");

async function create({ testId, userId, score, total, timeTakenSeconds, answers, breakdown }) {
  const { rows } = await pool.query(
    `INSERT INTO results (test_id, user_id, score, total, time_taken_seconds, answers, breakdown)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [testId, userId, score, total, timeTakenSeconds || null, JSON.stringify(answers), JSON.stringify(breakdown)]
  );
  return rows[0];
}

// Joins in the test title + owner so the controller can check
// "is this person allowed to see this result" without a second query.
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT r.*, t.title AS test_title, t.owner_id AS test_owner_id
     FROM results r
     JOIN tests t ON t.id = r.test_id
     WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findByUser(userId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.score, r.total, r.submitted_at, t.title
     FROM results r
     JOIN tests t ON t.id = r.test_id
     WHERE r.user_id = $1
     ORDER BY r.submitted_at DESC`,
    [userId]
  );
  return rows;
}

async function findByTest(testId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.score, r.total, r.submitted_at, u.name AS student_name
     FROM results r
     JOIN users u ON u.id = r.user_id
     WHERE r.test_id = $1
     ORDER BY r.submitted_at DESC`,
    [testId]
  );
  return rows;
}

module.exports = { create, findById, findByUser, findByTest };