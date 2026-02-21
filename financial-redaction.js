/**
 * Financial Data Redaction System
 * Logs Financial Agent communications to dashboard with sensitive info redacted
 * Full data stored privately in financial-agent-logs/
 */

/**
 * Redact sensitive financial information
 * Removes: numbers (amounts, net worth, targets), percentages, specific strategies
 * Keeps: task names, statuses, flow information
 */
function redactFinancialData(text) {
    if (!text) return text;
    
    // Redact currency amounts (SGD, USD, etc. with numbers)
    text = text.replace(/SGD\s*[\d,]+(\.\d{2})?/gi, 'SGD [REDACTED]');
    text = text.replace(/USD\s*[\d,]+(\.\d{2})?/gi, 'USD [REDACTED]');
    text = text.replace(/\$\s*[\d,]+(\.\d{2})?/gi, '$ [REDACTED]');
    
    // Redact percentage numbers
    text = text.replace(/\d+\.?\d*\s*%/g, '[REDACTED]%');
    
    // Redact large numbers (potential amounts)
    text = text.replace(/\b\d{6,}\b/g, '[REDACTED]');
    
    // Redact specific financial metrics
    text = text.replace(/net worth|net\s+worth/gi, '[NET WORTH REDACTED]');
    text = text.replace(/monthly\s+savings|savings\s+per\s+month/gi, '[MONTHLY SAVINGS REDACTED]');
    text = text.replace(/investment\s+return|roi|return\s+on\s+investment/gi, '[RETURNS REDACTED]');
    
    return text;
}

/**
 * Create redacted log entry for dashboard
 * @param {Object} originalLog - Full log with sensitive data
 * @returns {Object} Redacted version for dashboard
 */
function createRedactedLogEntry(originalLog) {
    const redacted = { ...originalLog };
    
    // Redact message
    if (redacted.message) {
        redacted.message = redactFinancialData(redacted.message);
    }
    
    // Redact outcome
    if (redacted.outcome) {
        redacted.outcome = redactFinancialData(redacted.outcome);
    }
    
    // Redact task description
    if (redacted.taskDescription) {
        redacted.taskDescription = redactFinancialData(redacted.taskDescription);
    }
    
    // Mark as redacted
    redacted.redacted = true;
    redacted.redactionNote = "Financial data redacted for confidentiality. Full details in private logs.";
    
    return redacted;
}

/**
 * Log financial communication to both locations
 * @param {Object} logEntry - Full log entry
 * @param {String} publicLogsPath - Path to public logs
 * @param {String} privateLogsPath - Path to private logs
 */
function logFinancialCommunication(logEntry, publicLogsPath, privateLogsPath) {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directories exist
    if (!fs.existsSync(publicLogsPath)) {
        fs.mkdirSync(publicLogsPath, { recursive: true });
    }
    if (!fs.existsSync(privateLogsPath)) {
        fs.mkdirSync(privateLogsPath, { recursive: true });
    }
    
    // Log to public dashboard (redacted)
    const redactedEntry = createRedactedLogEntry(logEntry);
    const publicLogFile = path.join(publicLogsPath, `financial-communications.jsonl`);
    fs.appendFileSync(publicLogFile, JSON.stringify(redactedEntry) + '\n');
    
    // Log to private storage (full data)
    const privateLogFile = path.join(privateLogsPath, `financial-${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(privateLogFile, JSON.stringify(logEntry) + '\n');
    
    console.log(`[Financial Log] Dual-logged: ${new Date().toISOString()}`);
}

module.exports = {
    redactFinancialData,
    createRedactedLogEntry,
    logFinancialCommunication
};
