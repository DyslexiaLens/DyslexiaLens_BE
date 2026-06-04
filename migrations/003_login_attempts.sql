CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(120) NOT NULL,
  ip_address VARCHAR(45),
  attempted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email
  ON login_attempts(email);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_attempted_at
  ON login_attempts(email, attempted_at);
