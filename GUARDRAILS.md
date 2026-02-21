# GUARDRAILS — Rate Limits & Budget Constraints

**Effective:** February 20, 2026  
**Owner:** Andrew  
**Priority:** CRITICAL — Enforce strictly

---

## 🚦 RATE LIMITS

### API Call Throttling
- **Minimum 5 seconds** between consecutive API calls
- **Do not burst** requests to the same provider
- Space out calls naturally; batch when possible

### Web Search Constraints
- **Minimum 10 seconds** between web search calls
- **Maximum 5 searches per batch**
- After 5 searches: **mandatory 2-minute break** before resuming
- Exception: Different queries with distinct purposes can be grouped, but still respect the 10-second spacing

### Batch Pattern (Critical)
- **Combine similar work into single requests**
- ❌ WRONG: Make 10 API calls to fetch 10 leads
- ✅ RIGHT: Make 1 API call requesting all 10 leads at once
- Reduces overhead, respects rate limits, improves efficiency

### Error Handling: HTTP 429 (Rate Limited)
- **If you receive a 429 error: STOP immediately**
- **Wait 5 minutes** before retrying
- Log the incident for transparency
- Do NOT attempt retries during the wait period
- Resume normal operation after 5 minutes has elapsed

---

## 💰 BUDGET CONSTRAINTS

### Daily Budget: $5 USD
- **Soft warning at 75%:** ($3.75 spent) — Notify Andrew
- **Hard limit at $5:** Stop all API calls, await instruction
- Resets at midnight Singapore time (UTC+8)

### Monthly Budget: $25 USD
- **Soft warning at 75%:** ($18.75 spent) — Notify Andrew
- **Hard limit at $25:** Stop all non-critical API calls, await instruction
- Resets on the 1st of each month at midnight Singapore time

### Budget Tracking
- Track cumulative spend per day and month
- Include cost in all tool responses when API calls are made
- Provide weekly budget summary in heartbeat (when implemented)

---

## 📋 Implementation Checklist

When making API calls, **always:**
- [ ] Check daily spend (warn at $3.75)
- [ ] Check monthly spend (warn at $18.75)
- [ ] Wait 5 seconds since last API call
- [ ] Batch similar requests into one call
- [ ] Wait 10 seconds between web searches
- [ ] Count searches (stop at 5, take 2-min break)
- [ ] Log estimated cost and actual cost
- [ ] If 429: Stop, wait 5min, retry

---

## ⚠️ Escalation Protocol

### When to Notify Andrew Immediately
1. Daily spend reaches $3.75 (75% of $5)
2. Monthly spend reaches $18.75 (75% of $25)
3. Repeated 429 errors (>3 in one session)
4. Unexpected spike in API costs
5. Rate limit exceeded despite compliance

### Message Format
```
⚠️ API Budget Alert

Status: [WARNING / CRITICAL]
Spent: $X.XX / $X.XX (YY% of [daily/monthly])
Remaining: $X.XX

[Brief explanation of what triggered the alert]

Recommendation: [Continue / Pause API calls / Adjust strategy]
```

---

## 🔒 Compliance Notes

- These guardrails are **non-negotiable**
- Respect them as if they're technical limits (they are financial ones)
- When in doubt, **ask Andrew** before exceeding any threshold
- Document any exceptions granted by Andrew in memory
- Review and adjust quarterly based on actual usage patterns

---

## Current Usage (Session: Feb 20, 2026)

| Item | Usage | Budget | Status |
|------|-------|--------|--------|
| Daily Spend | $0.XX | $5.00 | ✅ OK |
| Monthly Spend | $0.XX | $25.00 | ✅ OK |
| API Calls (5s spacing) | Compliant | — | ✅ OK |
| Web Searches (10s spacing) | 1 search | — | ✅ OK |

---

**Last Updated:** February 20, 2026 14:30 SGT
