#!/bin/bash
# generate-sprint-status.sh — Reads .ralph-plan.md and generates sprint-status.yaml
# Compatible with BMAD v6 bmm:workflows:sprint-status

set -euo pipefail

PLAN_FILE=".ralph-plan.md"
OUTPUT_DIR="_bmad-output/implementation-artifacts"
OUTPUT_FILE="$OUTPUT_DIR/sprint-status.yaml"

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "Error: $PLAN_FILE not found" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Declare associative arrays
declare -A story_status
declare -A story_deps
declare -A story_epic
declare -A story_epic_name
declare -A epic_names
declare -a story_order
declare -a epic_order_arr

story_id=""

# Parse .ralph-plan.md for story entries
while IFS= read -r line; do
  # Strip carriage returns (Windows line endings)
  line="${line%$'\r'}"
  # Match story headers: ### [EPIC-N] Story X.Y: Title
  if [[ "$line" =~ ^###[[:space:]]+\[EPIC-([0-9]+)\][[:space:]]+Story[[:space:]]+([0-9]+\.[0-9]+):[[:space:]]*(.*) ]]; then
    epic_num="${BASH_REMATCH[1]}"
    story_id="${BASH_REMATCH[2]}"
    story_title="${BASH_REMATCH[3]}"
    story_epic["$story_id"]="$epic_num"
    story_order+=("$story_id")

    # Track epic order (add only once)
    local_found=false
    for e in "${epic_order_arr[@]:-}"; do
      if [[ "$e" == "$epic_num" ]]; then
        local_found=true
        break
      fi
    done
    if [[ "$local_found" == false ]]; then
      epic_order_arr+=("$epic_num")
    fi
    continue
  fi

  # Match epic name: - **Epic:** Epic Name Here
  if [[ "$line" =~ ^\-[[:space:]]+\*\*Epic:\*\*[[:space:]]+(.*) ]]; then
    if [[ -n "$story_id" ]]; then
      local_epic="${story_epic[$story_id]}"
      epic_names["$local_epic"]="${BASH_REMATCH[1]}"
    fi
    continue
  fi

  # Match status: - **Status:** [x] done / [ ] pending / [!] blocked
  if [[ -n "$story_id" ]]; then
    if [[ "$line" == *"**Status:**"*"[x]"* ]]; then
      story_status["$story_id"]="done"
      continue
    elif [[ "$line" == *"**Status:**"*"[!]"* ]]; then
      story_status["$story_id"]="blocked"
      continue
    elif [[ "$line" == *"**Status:**"*"[ ]"* ]]; then
      story_status["$story_id"]="pending"
      continue
    fi
  fi

  # Match dependencies: - **Dependencies:** 1.1, 2.3 or None/none
  if [[ "$line" =~ ^\-[[:space:]]+\*\*Dependencies:\*\*[[:space:]]+(.*) ]]; then
    if [[ -n "$story_id" ]]; then
      deps="${BASH_REMATCH[1]}"
      if [[ "$deps" == "None" ]] || [[ "$deps" == "none" ]]; then
        story_deps["$story_id"]=""
      else
        story_deps["$story_id"]="$deps"
      fi
    fi
    continue
  fi
done < "$PLAN_FILE"

# Resolve pending stories: if all deps are done, mark as ready-for-dev
resolve_status() {
  local sid="$1"
  local raw="${story_status[$sid]:-pending}"

  if [[ "$raw" == "done" ]] || [[ "$raw" == "blocked" ]]; then
    echo "$raw"
    return
  fi

  # Check dependencies
  local deps_str="${story_deps[$sid]:-}"
  if [[ -z "$deps_str" ]]; then
    echo "ready-for-dev"
    return
  fi

  # Parse comma-separated dependency IDs
  IFS=',' read -ra dep_ids <<< "$deps_str"
  for dep in "${dep_ids[@]}"; do
    dep=$(echo "$dep" | tr -d ' ')
    if [[ -z "$dep" ]]; then continue; fi
    local dep_status="${story_status[$dep]:-pending}"
    if [[ "$dep_status" != "done" ]]; then
      echo "backlog"
      return
    fi
  done

  echo "ready-for-dev"
}

# Derive epic status from its stories
derive_epic_status() {
  local epic_num="$1"
  local has_done=false
  local has_pending=false
  local all_done=true

  for sid in "${story_order[@]}"; do
    if [[ "${story_epic[$sid]}" == "$epic_num" ]]; then
      local resolved
      resolved=$(resolve_status "$sid")
      if [[ "$resolved" == "done" ]]; then
        has_done=true
      else
        all_done=false
        has_pending=true
      fi
    fi
  done

  if [[ "$all_done" == true ]] && [[ "$has_done" == true ]]; then
    echo "done"
  elif [[ "$has_done" == true ]] && [[ "$has_pending" == true ]]; then
    echo "in-progress"
  else
    echo "backlog"
  fi
}

# Generate YAML
{
  echo "# Sprint Status — CurryDash Central Hub"
  echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "# Source: .ralph-plan.md"
  echo "#"
  echo "# Status values:"
  echo "#   Epic:  backlog | in-progress | done"
  echo "#   Story: backlog | ready-for-dev | in-progress | review | done | blocked"
  echo ""
  echo "project: CurryDash-Central-Hub"
  echo "tracking_system: file-system"
  echo "story_location: _bmad-output/implementation-artifacts"
  echo ""
  echo "development_status:"

  for epic_num in "${epic_order_arr[@]}"; do
    epic_stat=$(derive_epic_status "$epic_num")
    epic_name="${epic_names[$epic_num]:-Epic $epic_num}"
    echo ""
    echo "  # Epic $epic_num: $epic_name"
    echo "  epic-${epic_num}: $epic_stat"

    for sid in "${story_order[@]}"; do
      if [[ "${story_epic[$sid]}" == "$epic_num" ]]; then
        resolved=$(resolve_status "$sid")
        slug="${sid/./-}"
        echo "  ${slug}: $resolved"
      fi
    done

    echo "  epic-${epic_num}-retrospective: $([ "$epic_stat" = "done" ] && echo "optional" || echo "n/a")"
  done
} > "$OUTPUT_FILE"

echo "Generated: $OUTPUT_FILE"
echo ""

# Summary
done_count=0
pending_count=0
blocked_count=0
ready_count=0

for sid in "${story_order[@]}"; do
  resolved=$(resolve_status "$sid")
  case "$resolved" in
    done) done_count=$((done_count + 1)) ;;
    blocked) blocked_count=$((blocked_count + 1)) ;;
    ready-for-dev) ready_count=$((ready_count + 1)) ;;
    *) pending_count=$((pending_count + 1)) ;;
  esac
done

total=${#story_order[@]}
echo "Stories: $total total | $done_count done | $ready_count ready | $pending_count backlog | $blocked_count blocked"
