# Sub-Agent Communications Log

**Central Repository for All Sub-Agent Communications**

This directory stores all communications between Tim (main agent) and spawned sub-agents, enabling complete visibility and auditability of delegated tasks.

---

## Directory Structure

```
memory/subagent-communications/
├── README.md (this file)
├── active/
│   ├── [sessionId].jsonl (current sub-agent sessions)
│   └── [sessionId].jsonl
└── archive/
    ├── 2026-02-20.jsonl (completed sessions, archived by date)
    └── 2026-02-21.jsonl
```

---

## Log Entry Schema

Each communication is stored in JSONL format (one JSON object per line):

```json
{
  "timestamp": "2026-02-20T16:45:00.000Z",
  "sessionId": "session-uuid",
  "subagentId": "spawned-agent-id",
  "messageType": "spawn|send|receive|complete|error",
  "direction": "main→subagent|subagent→main",
  "taskName": "Task description",
  "taskDescription": "What the sub-agent was asked to do",
  "message": "The actual message content",
  "status": "pending|in_progress|completed|failed",
  "outcome": "Result/output if applicable",
  "cost": { "tokens_used": 0, "api_cost": 0.00 },
  "duration_seconds": 15,
  "error": null
}
```

---

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO-8601 | When the communication occurred (UTC) |
| `sessionId` | UUID | Unique identifier for the sub-agent session |
| `subagentId` | String | ID/name of the spawned sub-agent |
| `messageType` | Enum | `spawn`, `send`, `receive`, `complete`, `error` |
| `direction` | Enum | Who initiated: main→subagent or subagent→main |
| `taskName` | String | Short name of the task |
| `taskDescription` | String | Full description of what was requested |
| `message` | String | The actual message/prompt sent |
| `status` | Enum | Current status of the task |
| `outcome` | String | Result/output returned by sub-agent (or null if pending) |
| `cost` | Object | Token usage and API cost for this exchange |
| `duration_seconds` | Number | How long the task took to complete |
| `error` | String/null | Error message if task failed (null if successful) |

---

## Example Log Entry

```json
{"timestamp":"2026-02-20T16:00:00.000Z","sessionId":"ae8e75d8-d242","subagentId":"cache-metrics-reporter","messageType":"spawn","direction":"main→subagent","taskName":"End of Day Cache Metrics Report","taskDescription":"Generate cache hit/cost metrics for the day","message":"Generate an end-of-day cache metrics report...","status":"pending","outcome":null,"cost":{"tokens_used":0,"api_cost":0},"duration_seconds":0,"error":null}
```

---

## How Sub-Agents Use This System

**Sub-agents self-document their work:**

1. **On spawn:** Log initial task with status="pending"
2. **During work:** Update status="in_progress" with intermediate progress
3. **On completion:** Update with status="completed", outcome, cost, and duration
4. **On failure:** Log status="failed", error message, partial outcome if any
5. **Coordination:** Read other sub-agents' logs to avoid duplicate work or share results

**Example sub-agent workflow:**
```json
{"timestamp":"2026-02-20T16:00:00Z","sessionId":"cache-metrics","subagentId":"reporter","messageType":"spawn","status":"pending","outcome":null,"cost":{"tokens_used":0,"api_cost":0}}
{"timestamp":"2026-02-20T16:01:00Z","sessionId":"cache-metrics","subagentId":"reporter","messageType":"send","status":"in_progress","outcome":"Querying session logs...","cost":{"tokens_used":500,"api_cost":0.02}}
{"timestamp":"2026-02-20T16:02:30Z","sessionId":"cache-metrics","subagentId":"reporter","messageType":"complete","status":"completed","outcome":"Cache hits: 12, Cost savings: $0.45","cost":{"tokens_used":1500,"api_cost":0.05},"duration_seconds":150}
```

---

## How to Review Communications

### View Today's Communications
```bash
cat memory/subagent-communications/active/*.jsonl | grep "2026-02-20"
```

### View Specific Sub-Agent's Communications
```bash
grep "subagentId.*cache-metrics" memory/subagent-communications/**/*.jsonl
```

### View Failed Tasks Only
```bash
grep '"status":"failed"' memory/subagent-communications/**/*.jsonl
```

### View Cost Summary
```bash
grep '"messageType":"complete"' memory/subagent-communications/**/*.jsonl | jq '.cost.api_cost' | paste -sd+ | bc
```

---

## Access Permissions

- ✅ **Tim (main agent):** Full read/write (logs interactions and references logs in updates to Andrew)
- ✅ **Sub-agents:** Full read/write (self-log their work, update status in real-time, read other agents' logs for coordination)
- ✅ **Andrew (user):** Full read access (review any time via provided file references)

---

## Archival Schedule

- **Active logs:** Stored in `active/` directory
- **Archive trigger:** When task completes or at end of day (11:55 PM SGT)
- **Archived logs:** Moved to `archive/YYYY-MM-DD.jsonl`
- **Retention:** Keep all logs indefinitely (low storage cost)

---

## Integration with Cron Jobs

The cron job for "End of Day Cache Metrics Report" will:
1. Complete its task
2. Auto-log final outcome to `memory/subagent-communications/active/[sessionId].jsonl`
3. At 11:56 PM SGT, archive completed logs to `archive/2026-02-21.jsonl`

---

## Example Use Cases

**Andrew reviews sub-agent work:**
- "What did the cache metrics reporter find yesterday?"
- "Have any sub-agents failed? Show me the errors."
- "How much did delegated tasks cost in total?"

**Tim coordinates multiple sub-agents:**
- "Agent A, check the logs. Agent B already tried this approach..."
- Auto-detect duplicate work and prevent redundant tasks

**Audit trail:**
- Complete history of what was done, when, and by whom
- Cost tracking per task and per sub-agent
- Performance metrics (duration, success rate)

---

## Last Updated

**February 20, 2026**

Next review: End of day cron job will update this as operations continue.
