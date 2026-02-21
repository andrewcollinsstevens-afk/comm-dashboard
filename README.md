# Sub-Agent Communications Dashboard

Real-time monitoring and analytics for delegated AI tasks and sub-agent communications.

## Features

- 📊 **Live Dashboard** — View all sub-agent communications in one place
- 🔍 **Search & Filter** — Find tasks by name, status, or ID
- 📈 **Analytics** — Track costs, duration, success rates
- 💾 **JSONL Support** — Upload sub-agent communication logs directly
- 📱 **Responsive Design** — Works on desktop and mobile

## How to Use

### 1. Access the Dashboard
Open `index.html` in any modern web browser.

### 2. Upload JSONL Logs
Click **"Choose Files"** and select one or more JSONL files from:
```
memory/subagent-communications/active/
memory/subagent-communications/archive/
```

### 3. View Communications
The dashboard displays:
- **Timestamp** — When the task was recorded
- **Task Name** — What the sub-agent was doing
- **Status** — pending | in_progress | completed | failed
- **Outcome** — Result or summary
- **Cost** — API costs in USD
- **Duration** — Execution time in seconds
- **Error** — Any error messages (if failed)

### 4. Search & Filter
Use the search box to find tasks by:
- Task name
- Status
- Session ID
- Outcome text

### 5. Analytics
The stats cards show:
- **Total Tasks** — All sub-agent invocations
- **Completed** — Successfully finished tasks
- **Total Cost** — Cumulative API spending
- **Avg Duration** — Average execution time

## Data Format (JSONL)

Each line in the JSONL file should be a valid JSON object:

```json
{"timestamp":"2026-02-21T08:00:00Z","sessionId":"uuid","taskName":"daily-news-summary","status":"completed","outcome":"News summary generated","cost":{"tokens_used":2500,"api_cost":0.012},"duration_seconds":45,"error":null}
```

**Fields:**
- `timestamp` (ISO-8601) — When the task ran
- `sessionId` (string) — Unique session identifier
- `taskName` (string) — Name of the task
- `status` (string) — Task status
- `outcome` (string) — Result or summary
- `cost` (object) — API costs
  - `tokens_used` (number)
  - `api_cost` (number) — Cost in USD
- `duration_seconds` (number) — Execution time
- `error` (string|null) — Error message if failed

## Deployment

### Local
Simply open `index.html` in your browser.

### GitHub Pages (Recommended)
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Select **Deploy from a branch**
4. Choose `master` branch, `/root` folder
5. Dashboard will be live at: `https://username.github.io/comm-dashboard`

### Self-Hosted
Place `index.html` on any web server (Nginx, Apache, etc.).

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Offline Use

The dashboard works entirely in the browser with no backend required. All data is processed client-side.

## Privacy

All data processing happens in your browser. No data is sent to external servers.

---

**Repository:** https://github.com/andrewcollinsstevens-afk/comm-dashboard  
**Created:** Feb 21, 2026
