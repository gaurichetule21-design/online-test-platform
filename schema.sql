CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'instructor')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tests (
  id                SERIAL PRIMARY KEY,
  owner_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER NOT NULL DEFAULT 20,
  status            VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  access_code       VARCHAR(20) UNIQUE,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id              SERIAL PRIMARY KEY,
  test_id         INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'truefalse', 'short')),
  question_text   TEXT NOT NULL,
  options         JSONB,
  correct_answer  TEXT NOT NULL,
  position        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS results (
  id                  SERIAL PRIMARY KEY,
  test_id             INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score               INTEGER NOT NULL,
  total               INTEGER NOT NULL,
  time_taken_seconds  INTEGER,
  answers             JSONB NOT NULL,
  breakdown           JSONB NOT NULL,
  submitted_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_owner ON tests(owner_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_results_test ON results(test_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id);