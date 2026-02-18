#!/bin/bash
# PostToolUse hook: Remind to update progress.md after file modifications
if [ -f progress.md ]; then
  echo "REMINDER: Consider updating progress.md with what was just changed." >&2
fi
