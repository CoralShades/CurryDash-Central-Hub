-- =============================================================================
-- Migration: Add soft-delete support to dashboard_widgets
-- Story 7.4: AI Widget Persistence & Management
--
-- Adds deleted_at for soft-delete (FR43) — widgets are never hard-deleted.
-- Adds is_ai_generated flag to distinguish AI-created widgets from static ones.
-- =============================================================================

ALTER TABLE dashboard_widgets
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_active
  ON dashboard_widgets (user_id, deleted_at)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN dashboard_widgets.deleted_at IS
  'Soft-delete timestamp. NULL = active. Set to NOW() to remove from dashboard (FR43).';

COMMENT ON COLUMN dashboard_widgets.is_ai_generated IS
  'TRUE for widgets created via AI generation (FR43). FALSE for static/registry widgets.';
