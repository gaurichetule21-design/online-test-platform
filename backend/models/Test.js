// models/Test.js
const pool = require("../config/db");

function generateAccessCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function create({ ownerId, title, description, durationMinutes, status }) {
  const { rows } = await pool.query(
    `INSERT INTO tests (owner_id, title, description, duration_minutes, status, access_code)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [ownerId, title, description || null, durationMinutes, status, generateAccessCode()]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM tests WHERE id = $1`, [id]);
  return rows[0] || null;
}

// Instructor's own tests, with question count / attempt count / average score
// computed in one query rather than N+1 round trips.
async function findByOwnerWithStats(ownerId) {
  const { rows } = await pool.query(
    `SELECT t.id, t.title, t.status,
            COUNT(DISTINCT q.id) AS questions,
            COUNT(DISTINCT r.id) AS attempts,
            ROUND(AVG(CASE WHEN r.id IS NOT NULL THEN (r.score::numeric / r.total) * 100 END)) AS avg_score
     FROM tests t
     LEFT JOIN questions q ON q.test_id = t.id
     LEFT JOIN results r ON r.test_id = t.id
     WHERE t.owner_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [ownerId]
  );
  return rows;
}

async function findPublished() {
  const { rows } = await pool.query(
    `SELECT t.id, t.title, t.duration_minutes, t.access_code,
            COUNT(q.id) AS questions
     FROM tests t
     LEFT JOIN questions q ON q.test_id = t.id
     WHERE t.status = 'published'
     GROUP BY t.id
     ORDER BY t.created_at DESC`
  );
  return rows;
}

module.exports = { create, findById, findByOwnerWithStats, findPublished };