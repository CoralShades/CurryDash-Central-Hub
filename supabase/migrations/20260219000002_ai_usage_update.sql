-- ---------------------------------------------------------------------------
-- Migration: Update ai_usage to per-request tracking schema
--
-- The initial schema used a date-aggregated model (date + model UNIQUE).
-- The Mastra AI backend (story 6.1) requires per-request tracking to support:
--   - Per-user cost attribution (user_id)
--   - Granular token breakdown (prompt_tokens + completion_tokens)
--   - Request type classification (simple/complex/report)
--   - $50/month budget monitoring with 80% warn threshold
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS ai_usage CASCADE;

CREATE TABLE ai_usage (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID           REFERENCES users(id) ON DELETE SET NULL,
  model               TEXT           NOT NULL,
  prompt_tokens       INTEGER        NOT NULL DEFAULT 0,
  completion_tokens   INTEGER        NOT NULL DEFAULT 0,
  total_tokens        INTEGER        NOT NULL DEFAULT 0,
  estimated_cost_usd  NUMERIC(10, 8) NOT NULL DEFAULT 0,
  request_type        TEXT,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Admins can view all usage; others see only their own
CREATE POLICY "ai_usage_read_own"
  ON ai_usage FOR SELECT
  USING (
    auth.jwt()->>'role' = 'admin'
    OR user_id = auth.uid()
  );

-- Only service-role inserts (via admin client in record-usage.ts)
-- No user-facing insert policy needed

CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at DESC);
CREATE INDEX idx_ai_usage_user_id    ON ai_usage(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_model      ON ai_usage(model, created_at DESC);
