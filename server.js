#!/usr/bin/env node

/**
 * Sub-Agent Communications Dashboard Backend
 * Serves JSONL logs from memory/subagent-communications/ via REST API
 * Requires authentication token to access
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { retryWithBackoff } = require('./error-handler');

const app = express();
const PORT = process.env.PORT || 8642;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'openclaw-comm-dashboard-2026';
const LOGS_DIR = path.join(process.env.WORKSPACE_PATH || '/root/.openclaw/workspace', 'memory', 'subagent-communications');
const ACTIVE_DIR = path.join(LOGS_DIR, 'active');
const ARCHIVE_DIR = path.join(LOGS_DIR, 'archive');

app.use(cors());
app.use(express.json());

// Middleware: Verify authentication token
const authenticate = (req, res, next) => {
    const token = req.headers['x-auth-token'] || req.query.token;
    
    if (!token || token !== AUTH_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing authentication token' });
    }
    
    next();
};

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Verify token validity (lightweight check)
app.get('/api/verify-token', (req, res) => {
    const token = req.headers['x-auth-token'] || req.query.token;
    
    if (!token || token !== AUTH_TOKEN) {
        return res.status(401).json({ valid: false });
    }
    
    res.json({ valid: true });
});

// Get all communications logs (with auto-retry on error)
app.get('/api/communications', authenticate, async (req, res) => {
    const readLogsFunction = async () => {
        const allLogs = [];

        // Read active logs
        if (fs.existsSync(ACTIVE_DIR)) {
            const activeFiles = fs.readdirSync(ACTIVE_DIR).filter(f => f.endsWith('.jsonl'));
            activeFiles.forEach(file => {
                const filePath = path.join(ACTIVE_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            allLogs.push(JSON.parse(line));
                        } catch (e) {
                            console.error(`Error parsing line in ${file}:`, e.message);
                        }
                    }
                });
            });
        }

        // Read archive logs
        if (fs.existsSync(ARCHIVE_DIR)) {
            const archiveFiles = fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.jsonl'));
            archiveFiles.forEach(file => {
                const filePath = path.join(ARCHIVE_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            allLogs.push(JSON.parse(line));
                        } catch (e) {
                            console.error(`Error parsing line in ${file}:`, e.message);
                        }
                    }
                });
            });
        }

        // Sort by timestamp descending
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return allLogs;
    };

    try {
        const allLogs = await retryWithBackoff(readLogsFunction, 'api-read-communications');
        
        if (allLogs === null) {
            return res.status(500).json({ error: 'Failed to read logs after 3 retries' });
        }

        res.json({
            count: allLogs.length,
            data: allLogs,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).json({ error: 'Failed to read logs', details: error.message });
    }
});

// Get summary statistics (with auto-retry on error)
app.get('/api/stats', authenticate, async (req, res) => {
    const calculateStatsFunction = async () => {
        const allLogs = [];

        if (fs.existsSync(ACTIVE_DIR)) {
            const activeFiles = fs.readdirSync(ACTIVE_DIR).filter(f => f.endsWith('.jsonl'));
            activeFiles.forEach(file => {
                const filePath = path.join(ACTIVE_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            allLogs.push(JSON.parse(line));
                        } catch (e) { }
                    }
                });
            });
        }

        if (fs.existsSync(ARCHIVE_DIR)) {
            const archiveFiles = fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.jsonl'));
            archiveFiles.forEach(file => {
                const filePath = path.join(ARCHIVE_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        try {
                            allLogs.push(JSON.parse(line));
                        } catch (e) { }
                    }
                });
            });
        }

        const totalTasks = allLogs.length;
        const completedTasks = allLogs.filter(r => r.status === 'completed').length;
        const failedTasks = allLogs.filter(r => r.status === 'failed').length;
        const totalCost = allLogs.reduce((sum, r) => sum + (r.cost?.api_cost || 0), 0);
        const avgDuration = totalTasks > 0 ? Math.round(allLogs.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / totalTasks) : 0;

        return {
            totalTasks,
            completedTasks,
            failedTasks,
            totalCost: parseFloat(totalCost.toFixed(4)),
            avgDuration
        };
    };

    try {
        const stats = await retryWithBackoff(calculateStatsFunction, 'api-calculate-stats');
        
        if (stats === null) {
            return res.status(500).json({ error: 'Failed to calculate stats after 3 retries' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate stats', details: error.message });
    }
});

// Serve static dashboard
app.use(express.static(path.join(__dirname)));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`[Sub-Agent Communications Backend]`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/communications`);
    console.log(`Auth Token: ${AUTH_TOKEN.substring(0, 20)}...`);
    console.log(`Logs directory: ${LOGS_DIR}`);
    console.log(`Dashboard: http://localhost:${PORT}/index.html`);
});
