require("dotenv").config();

const pool = require("./config/db");

async function testDB() {
  try {
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    console.log("DB_NAME:", process.env.DB_NAME);

    const result = await pool.query("SELECT NOW()");

    console.log("✅ Database Connected Successfully!");
    console.log(result.rows[0]);

  } catch (error) {
    console.error("❌ Database Connection Error:");
    console.error(error.message);

  } finally {
    await pool.end();
  }
}

testDB();