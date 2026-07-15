// models/Question.js
const pool = require("../config/db");

// Used when a whole test (with its questions) is created in one request.
// `questions` items look like: { type, text, options, correctIndex, expected }
async function bulkCreate(testId, questions) {
  const inserted = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const correctAnswer = q.type === "short" ? q.expected : String(q.correctIndex);
    const { rows } = await pool.query(
      `INSERT INTO questions (test_id, type, question_text, options, correct_answer, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [testId, q.type, q.text, q.options ? JSON.stringify(q.options) : null, correctAnswer, i]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}

async function findByTestId(testId) {
  const { rows } = await pool.query(
    `SELECT * FROM questions WHERE test_id = $1 ORDER BY position ASC`,
    [testId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM questions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create({ testId, type, text, options, correctAnswer, position }) {
  const { rows } = await pool.query(
    `INSERT INTO questions (test_id, type, question_text, options, correct_answer, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [testId, type, text, options ? JSON.stringify(options) : null, correctAnswer, position || 0]
  );
  return rows[0];
}

async function update(id, fields) {
  const { rows } = await pool.query(
    `UPDATE questions SET
       type           = COALESCE($1, type),
       question_text  = COALESCE($2, question_text),
       options        = COALESCE($3, options),
       correct_answer = COALESCE($4, correct_answer)
     WHERE id = $5
     RETURNING *`,
    [fields.type, fields.text, fields.options ? JSON.stringify(fields.options) : null, fields.correctAnswer, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
}

module.exports = { bulkCreate, findByTestId, findById, create, update, remove };