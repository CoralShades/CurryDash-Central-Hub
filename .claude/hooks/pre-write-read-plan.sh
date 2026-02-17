#!/bin/bash
# PreToolUse hook: Re-read task_plan.md before Write/Edit operations
# Ensures changes align with the current plan
if [ -f task_plan.md ]; then
  echo "=== Current Task Plan ===" >&2
  cat task_plan.md >&2
  echo "=========================" >&2
fi
