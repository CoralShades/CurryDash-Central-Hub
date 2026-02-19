#!/bin/bash
# ralph.sh — Canonical bash-based Ralph loop for CurryDash Central Hub
# Spawns fresh `claude -p` per story for clean context windows.
#
# Usage:
#   ./ralph.sh                          # Run with defaults (max 15 iterations)
#   ./ralph.sh --max-iterations 5       # Limit to 5 stories
#   ./ralph.sh --story 5.3              # Target specific story
#   ./ralph.sh --dry-run                # Print prompt without executing
#   ./ralph.sh --sleep 5                # 5s pause between iterations

set -euo pipefail

# === Configuration ===
PLAN_FILE=".ralph-plan.md"
EPICS_FILE="_bmad-output/planning-artifacts/epics.md"
ARCH_FILE="_bmad-output/planning-artifacts/architecture.md"
PROMPT_TEMPLATE="RALPH_PROMPT.md"
SPRINT_STATUS_SCRIPT="./generate-sprint-status.sh"

MAX_ITERATIONS=15
TARGET_STORY=""
DRY_RUN=false
SLEEP_SECONDS=3
NO_PROGRESS_THRESHOLD=3

# === Parse Arguments ===
while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-iterations) MAX_ITERATIONS="$2"; shift 2 ;;
    --story) TARGET_STORY="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --sleep) SLEEP_SECONDS="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: ./ralph.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --max-iterations N   Max stories to process (default: 15)"
      echo "  --story X.Y          Target a specific story ID"
      echo "  --dry-run            Print assembled prompt, don't execute"
      echo "  --sleep N            Seconds between iterations (default: 3)"
      echo "  -h, --help           Show this help"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# === Preflight Checks ===
if ! command -v claude &>/dev/null; then
  echo "Error: 'claude' CLI not found in PATH. Install Claude Code first." >&2
  exit 1
fi

for f in "$PLAN_FILE" "$EPICS_FILE" "$ARCH_FILE" "$PROMPT_TEMPLATE"; do
  if [[ ! -f "$f" ]]; then
    echo "Error: Required file not found: $f" >&2
    exit 1
  fi
done

# Check for stale ralph-wiggum state file
if [[ -f ".claude/ralph-loop.local.md" ]]; then
  echo "WARNING: .claude/ralph-loop.local.md exists — ralph-wiggum plugin may interfere."
  echo "         Remove it with: rm .claude/ralph-loop.local.md"
  echo ""
fi

# === Helper Functions ===

find_next_story() {
  # Returns the first story ID whose status is [ ] pending and all deps are done
  # If --story was specified, return that directly
  if [[ -n "$TARGET_STORY" ]]; then
    echo "$TARGET_STORY"
    return
  fi

  local story_id=""
  local in_story=false

  while IFS= read -r line; do
    line="${line%$'\r'}"  # Strip Windows CRLF \r (files on /mnt/d/ have \r\n endings)
    # Match story header: ### [EPIC-N] Story X.Y: Title
    if [[ "$line" =~ ^###[[:space:]]+\[EPIC-[0-9]+\][[:space:]]+Story[[:space:]]+([0-9]+\.[0-9]+): ]]; then
      story_id="${BASH_REMATCH[1]}"
      in_story=true
      local status=""
      local deps=""
      continue
    fi

    if [[ "$in_story" == true ]]; then
      # Check status
      if [[ "$line" =~ ^\-[[:space:]]+\*\*Status:\*\*[[:space:]]+\[\ \][[:space:]]pending ]]; then
        status="pending"
      elif [[ "$line" =~ ^\-[[:space:]]+\*\*Status:\*\*[[:space:]]+\[x\] ]]; then
        status="done"
        in_story=false
        continue
      elif [[ "$line" =~ ^\-[[:space:]]+\*\*Status:\*\*[[:space:]]+\[!\] ]]; then
        status="blocked"
        in_story=false
        continue
      fi

      # Check dependencies
      if [[ "$line" =~ ^\-[[:space:]]+\*\*Dependencies:\*\*[[:space:]]+(.*) ]]; then
        deps="${BASH_REMATCH[1]}"

        # If status is pending, check if deps are met
        if [[ "$status" == "pending" ]]; then
          if [[ "$deps" == "none" ]] || [[ "$deps" == "None" ]]; then
            echo "$story_id"
            return
          fi

          # Check each dependency
          local all_deps_met=true
          IFS=',' read -ra dep_ids <<< "$deps"
          for dep in "${dep_ids[@]}"; do
            dep=$(echo "$dep" | tr -d ' ')
            [[ -z "$dep" ]] && continue
            # Check if dep story has [x] done status
            if ! grep -q "Story ${dep}:" "$PLAN_FILE" || \
               ! grep -A1 "Story ${dep}:" "$PLAN_FILE" | grep -q '\[x\]'; then
              all_deps_met=false
              break
            fi
          done

          if [[ "$all_deps_met" == true ]]; then
            echo "$story_id"
            return
          fi
        fi
        in_story=false
      fi
    fi
  done < "$PLAN_FILE"

  echo ""  # No eligible story found
}

extract_story_content() {
  local sid="$1"
  local content
  content=$(awk -v sid="$sid" '
    $0 ~ "### \\[EPIC-[0-9]+\\] Story " sid ":" { found=1; next }
    found && /^### \[EPIC-/ { exit }
    found { print }
  ' "$PLAN_FILE")
  if [[ -z "$content" ]]; then
    echo "Error: No story content found for story $sid in $PLAN_FILE" >&2
    echo "       Verify header format: ### [EPIC-N] Story X.Y: Title" >&2
    return 1
  fi
  echo "$content"
}

extract_acceptance_criteria() {
  local sid="$1"
  local content
  content=$(awk -v sid="$sid" '
    $0 ~ "### Story " sid ":" { found=1; next }
    found && (/^### Story [0-9]/ || /^---$/ || /^## Epic [0-9]/) { exit }
    found { print }
  ' "$EPICS_FILE")
  if [[ -z "$content" ]]; then
    echo "Warning: No acceptance criteria found for story $sid in $EPICS_FILE" >&2
  fi
  echo "$content"
}

extract_architecture_section() {
  local sid="$1"
  local epic_num="${sid%%.*}"

  # Always include these sections
  local keywords="Implementation Patterns|Project Structure"

  # Add epic-specific keywords
  case "$epic_num" in
    5) keywords="$keywords|GitHub|Webhook Pipeline|HMAC|Octokit|Repository" ;;
    6) keywords="$keywords|AI|CopilotKit|Mastra|MCP|Agent|Model Routing" ;;
    7) keywords="$keywords|AI|Report|Widget|Dashboard|Analytics" ;;
    8) keywords="$keywords|Admin|System Health|Observability|Dead Letter|Monitoring" ;;
    *) keywords="$keywords|Dashboard|Widget" ;;
  esac

  # Extract matching ## sections from architecture.md
  awk -v pat="$keywords" '
    /^## / {
      if (match($0, pat)) { printing=1 } else { printing=0 }
    }
    printing { print }
  ' "$ARCH_FILE"
}

build_prompt() {
  local sid="$1"
  local story_content
  local acceptance_criteria
  local arch_section
  local tmp_story tmp_ac tmp_arch

  tmp_story=$(mktemp) || { echo "Error: mktemp failed" >&2; return 1; }
  tmp_ac=$(mktemp)    || { rm -f "$tmp_story"; echo "Error: mktemp failed" >&2; return 1; }
  tmp_arch=$(mktemp)  || { rm -f "$tmp_story" "$tmp_ac"; echo "Error: mktemp failed" >&2; return 1; }
  # shellcheck disable=SC2064
  trap "rm -f '$tmp_story' '$tmp_ac' '$tmp_arch'" RETURN

  story_content=$(extract_story_content "$sid") || return 1
  acceptance_criteria=$(extract_acceptance_criteria "$sid")
  arch_section=$(extract_architecture_section "$sid")

  # Check for partial implementation (Story 5.3 recovery)
  if git log --oneline 2>/dev/null | grep -qi "story ${sid} partial"; then
    story_content="NOTE: A partial implementation exists for this story. Review existing code
at src/modules/ for what's already been built. Identify which acceptance criteria
are already met and implement ONLY the remaining gaps. Do NOT rewrite working code.
Check git log for the partial commit to understand what was done.

${story_content}"
  fi

  # Read template and substitute placeholders
  local prompt
  prompt=$(<"$PROMPT_TEMPLATE")

  echo "$story_content" > "$tmp_story"
  echo "$acceptance_criteria" > "$tmp_ac"
  echo "$arch_section" > "$tmp_arch"

  # Build the final prompt by replacing placeholders
  prompt="${prompt//\{\{STORY_CONTENT\}\}/$(cat "$tmp_story")}"
  prompt="${prompt//\{\{ACCEPTANCE_CRITERIA\}\}/$(cat "$tmp_ac")}"
  prompt="${prompt//\{\{ARCHITECTURE_SECTION\}\}/$(cat "$tmp_arch")}"

  echo "$prompt"
}

check_all_done_or_blocked() {
  local pending
  pending=$(grep -c '\[ \] pending' "$PLAN_FILE" 2>/dev/null || echo "0")
  local blocked
  blocked=$(grep -c '\[!\]' "$PLAN_FILE" 2>/dev/null || echo "0")
  local done_count
  done_count=$(grep -c '\[x\] done' "$PLAN_FILE" 2>/dev/null || echo "0")

  if [[ "$pending" -eq 0 ]] && [[ "$blocked" -eq 0 ]]; then
    echo "ALL STORIES COMPLETE ($done_count total)"
    return 0
  elif [[ "$pending" -eq 0 ]] && [[ "$blocked" -gt 0 ]]; then
    echo "ALL REMAINING STORIES BLOCKED ($blocked blocked, $done_count done)"
    return 1
  fi
  return 2
}

check_epic_completion() {
  local sid="$1"
  local epic_num="${sid%%.*}"

  # Check if all stories in this epic are done
  local epic_pending
  epic_pending=$(grep -A1 "\[EPIC-${epic_num}\]" "$PLAN_FILE" | grep -c '\[ \] pending' || echo "0")

  if [[ "$epic_pending" -eq 0 ]]; then
    echo ""
    echo "==========================================="
    echo "  EPIC $epic_num COMPLETE!"
    echo "==========================================="
    echo ""
    echo "Recommended next steps:"
    echo "  1. Code review (fresh context, adversarial):"
    echo "     claude -p \"Run /bmad:bmm:workflows:code-review for Epic $epic_num\" --dangerously-skip-permissions"
    echo ""
    echo "  2. Retrospective (optional):"
    echo "     claude -p \"Run /bmad:bmm:workflows:retrospective for Epic $epic_num\" --dangerously-skip-permissions"
    echo ""
    echo "  3. Sprint status check:"
    echo "     claude -p \"Run /bmad:bmm:workflows:sprint-status\" --dangerously-skip-permissions"
    echo "==========================================="
  fi
}

update_sprint_status() {
  if [[ ! -f "$SPRINT_STATUS_SCRIPT" ]]; then
    echo "Warning: $SPRINT_STATUS_SCRIPT not found — skipping sprint status update" >&2
    return 0
  fi
  if [[ ! -x "$SPRINT_STATUS_SCRIPT" ]]; then
    echo "Warning: $SPRINT_STATUS_SCRIPT is not executable — skipping sprint status update" >&2
    return 0
  fi
  if ! "$SPRINT_STATUS_SCRIPT"; then
    echo "Warning: Sprint status update failed (exit $?) — continuing loop" >&2
  fi
}

# === Main Loop ===
ITERATION=0
NO_PROGRESS_COUNT=0
LAST_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

echo "======================================"
echo "  Ralph Loop — CurryDash Central Hub"
echo "======================================"
echo "Branch: $CURRENT_BRANCH"
echo "Max iterations: $MAX_ITERATIONS"
echo "Sleep between: ${SLEEP_SECONDS}s"
if [[ -n "$TARGET_STORY" ]]; then
  echo "Target story: $TARGET_STORY"
fi
echo ""

# Graceful shutdown
trap 'echo ""; echo "Interrupted at iteration $ITERATION. Current story: ${current_story:-none}"; exit 130' INT

while true; do
  # Check iteration limit
  if [[ $MAX_ITERATIONS -gt 0 ]] && [[ $ITERATION -ge $MAX_ITERATIONS ]]; then
    echo ""
    echo "Reached max iterations: $MAX_ITERATIONS"
    break
  fi

  # Find next story
  current_story=$(find_next_story)

  if [[ -z "$current_story" ]]; then
    echo ""
    check_all_done_or_blocked || true
    break
  fi

  ITERATION=$((ITERATION + 1))
  echo ""
  echo "======================== ITERATION $ITERATION ========================"
  echo "Story: $current_story"
  echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""

  # Build the prompt
  prompt=$(build_prompt "$current_story")

  # Dry run mode — print prompt and exit
  if [[ "$DRY_RUN" == true ]]; then
    echo "=== DRY RUN — Assembled Prompt ==="
    echo "$prompt"
    echo ""
    echo "=== Prompt size: $(echo "$prompt" | wc -c) bytes ==="
    break
  fi

  # Run Claude with fresh context
  # Note: --dangerously-skip-permissions required for non-interactive automation —
  # the settings.json allowlist restricts individual commands within the session.
  claude_exit=0
  output=$(echo "$prompt" | claude -p --dangerously-skip-permissions --verbose 2>&1) || claude_exit=$?

  if [[ $claude_exit -ne 0 ]]; then
    echo "ERROR: claude -p exited with code $claude_exit for story $current_story" >&2
    echo "       Last 20 lines of output:" >&2
    echo "$output" | tail -20 >&2
    NO_PROGRESS_COUNT=$((NO_PROGRESS_COUNT + 1))
    echo "Treating as no-progress. Stall count: $NO_PROGRESS_COUNT/$NO_PROGRESS_THRESHOLD"
    if [[ $NO_PROGRESS_COUNT -ge $NO_PROGRESS_THRESHOLD ]]; then
      echo "CIRCUIT BREAKER: $NO_PROGRESS_THRESHOLD consecutive Claude failures. Stopping." >&2
      exit 1
    fi
    sleep "$SLEEP_SECONDS"
    continue
  fi

  # Check for rate limit
  if echo "$output" | grep -qi "rate.limit\|429\|usage limit\|too many requests"; then
    echo "Rate limit detected. Waiting 10 minutes..."
    ITERATION=$((ITERATION - 1))  # Don't count this iteration
    sleep 600
    continue
  fi

  # Check for completion signal
  if echo "$output" | grep -q "STORY_COMPLETE"; then
    echo "Story $current_story COMPLETE"
    update_sprint_status
    check_epic_completion "$current_story"
    NO_PROGRESS_COUNT=0

    # Push as safety net
    if ! git push origin "$CURRENT_BRANCH" 2>&1; then
      echo "Warning: git push failed — commits are local only. Run: git push origin $CURRENT_BRANCH" >&2
    fi
  elif echo "$output" | grep -q "STORY_BLOCKED"; then
    reason=$(echo "$output" | grep "STORY_BLOCKED:" | tail -1 | sed 's/.*STORY_BLOCKED: //')
    echo "Story $current_story BLOCKED: $reason"
    update_sprint_status
    NO_PROGRESS_COUNT=0  # A blocked story is still progress
  elif echo "$output" | grep -q "<promise>ALL_STORIES_COMPLETE</promise>"; then
    echo ""
    echo "ALL STORIES COMPLETE!"
    update_sprint_status
    if ! git push origin "$CURRENT_BRANCH" 2>&1; then
      echo "Warning: git push failed — commits are local only. Run: git push origin $CURRENT_BRANCH" >&2
    fi
    break
  else
    echo "WARNING: Story $current_story ended without clear signal."
    echo "         Check .ralph-plan.md for status updates."
  fi

  # Circuit breaker: detect no progress
  CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
  if [[ "$CURRENT_COMMIT" == "$LAST_COMMIT" ]]; then
    NO_PROGRESS_COUNT=$((NO_PROGRESS_COUNT + 1))
    echo "No new commit. Stall count: $NO_PROGRESS_COUNT/$NO_PROGRESS_THRESHOLD"

    if [[ $NO_PROGRESS_COUNT -ge $NO_PROGRESS_THRESHOLD ]]; then
      echo ""
      echo "CIRCUIT BREAKER: $NO_PROGRESS_THRESHOLD iterations with no commits. Stopping."
      echo "Check the output above for errors or blockers."
      break
    fi
  else
    NO_PROGRESS_COUNT=0
    LAST_COMMIT="$CURRENT_COMMIT"
  fi

  # Clear target story after first iteration (so loop continues to next)
  TARGET_STORY=""

  # Pause between iterations
  sleep "$SLEEP_SECONDS"
done

echo ""
echo "======================================"
echo "  Ralph loop finished"
echo "  Iterations: $ITERATION"
echo "  Final commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'none')"
echo "======================================"
