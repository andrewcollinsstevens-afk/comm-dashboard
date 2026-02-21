# Sub-Agent Communications Query Guide

Quick reference for reviewing sub-agent activity.

---

## Quick Commands

### View All Today's Communications (Human-Readable)
```bash
cat memory/subagent-communications/active/*.jsonl | jq '.'
```

### View Latest 10 Communications
```bash
cat memory/subagent-communications/active/*.jsonl | tail -10 | jq '.'
```

### Find All Failed Tasks
```bash
cat memory/subagent-communications/**/*.jsonl | jq 'select(.status=="failed")'
```

### Find All Completed Tasks
```bash
cat memory/subagent-communications/**/*.jsonl | jq 'select(.status=="completed")'
```

### Find Communications for Specific Sub-Agent
```bash
cat memory/subagent-communications/**/*.jsonl | jq "select(.subagentId==\"cache-metrics-reporter\")"
```

### Find Tasks That Took Longer Than 60 Seconds
```bash
cat memory/subagent-communications/**/*.jsonl | jq "select(.duration_seconds > 60)"
```

### Calculate Total Cost of All Sub-Agent Work
```bash
cat memory/subagent-communications/**/*.jsonl | jq '.cost.api_cost' | paste -sd+ | bc
```

### View Task Timeline (Timestamp Order)
```bash
cat memory/subagent-communications/**/*.jsonl | jq -s 'sort_by(.timestamp) | .[] | "\(.timestamp) | \(.subagentId) | \(.taskName) | \(.status)"' -r
```

### Find Error Messages
```bash
cat memory/subagent-communications/**/*.jsonl | jq 'select(.error != null) | {timestamp, subagentId, taskName, error}'
```

### View Cost Per Sub-Agent
```bash
cat memory/subagent-communications/**/*.jsonl | jq 'group_by(.subagentId) | map({agent: .[0].subagentId, total_cost: (map(.cost.api_cost) | add), task_count: length})'
```

---

## Using jq for Advanced Queries

### Count Successful vs Failed Tasks
```bash
cat memory/subagent-communications/**/*.jsonl | jq '[.status] | group_by(.) | map({status: .[0], count: length})'
```

### Find Tasks with Specific Keyword
```bash
cat memory/subagent-communications/**/*.jsonl | jq "select(.taskName | contains(\"cache\"))"
```

### Export to CSV (for spreadsheet analysis)
```bash
cat memory/subagent-communications/**/*.jsonl | jq -r '[.timestamp, .subagentId, .taskName, .status, .cost.api_cost, .duration_seconds] | @csv' > subagent_report.csv
```

---

## Real-World Examples

**Example 1: Review all communications from the cache metrics reporter**
```bash
cat memory/subagent-communications/**/*.jsonl | jq "select(.subagentId==\"cache-metrics-reporter\") | {timestamp, status, duration: .duration_seconds, cost: .cost.api_cost}"
```

**Example 2: Find why a task failed**
```bash
cat memory/subagent-communications/**/*.jsonl | jq "select(.status==\"failed\") | {taskName, error, timestamp}"
```

**Example 3: Weekly cost summary**
```bash
cat memory/subagent-communications/archive/2026-02-20.jsonl | jq '[.cost.api_cost] | add'
```

---

## Tips

- **jq:** Learn more at https://stedolan.github.io/jq/
- **Pipe to less:** Add `| less` to any command to page through results
- **Pretty print:** Use `jq '.'` to make JSON human-readable
- **Raw output:** Use `-r` flag with jq for text without quotes
- **Grep + jq:** Combine grep for file filtering, jq for JSON parsing

---

## File Locations

- **Active logs:** `memory/subagent-communications/active/[sessionId].jsonl`
- **Archived logs:** `memory/subagent-communications/archive/YYYY-MM-DD.jsonl`
- **Schema:** `memory/subagent-communications/README.md`
- **Example log:** `memory/subagent-communications/active/EXAMPLE-cache-metrics.jsonl`
