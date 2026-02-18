#!/bin/bash
# Stop hook: Verify task_plan.md completion status before ending session
if [ -f task_plan.md ]; then
  pending=$(grep -c '\[ \]' task_plan.md 2>/dev/null || echo 0)
  completed=$(grep -c '\[x\]' task_plan.md 2>/dev/null || echo 0)
  if [ "$pending" -gt 0 ]; then
    echo "WARNING: $pending tasks still pending in task_plan.md ($completed completed)" >&2
  else
    echo "All tasks in task_plan.md are completed ($completed total)." >&2
  fi
fi
