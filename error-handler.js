/**
 * Error Handler with Auto-Retry Logic
 * Implements: Retry 3 times with 2-min delays before escalating to user
 */

const fs = require('fs');
const path = require('path');

const ERROR_LOG_DIR = path.join(process.env.WORKSPACE_PATH || '/root/.openclaw/workspace', 'memory', 'error-logs');

// Ensure error log directory exists
if (!fs.existsSync(ERROR_LOG_DIR)) {
    fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

/**
 * Retry handler with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {String} taskName - Name of the task for logging
 * @param {Number} maxRetries - Max retry attempts (default: 3)
 * @param {Number} delayMs - Delay between retries in milliseconds (default: 120000 = 2 mins)
 * @returns {Promise} Result or null if all retries fail
 */
async function retryWithBackoff(fn, taskName, maxRetries = 3, delayMs = 120000) {
    let lastError = null;
    const attempts = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            
            // Log successful recovery if it was a retry
            if (attempt > 1) {
                logError(taskName, `✅ Recovered on attempt ${attempt}/${maxRetries}`, 'recovered', attempts);
            }
            
            return result;
        } catch (error) {
            lastError = error;
            const errorMsg = error.message || String(error);
            
            attempts.push({
                attempt,
                timestamp: new Date().toISOString(),
                error: errorMsg
            });

            if (attempt < maxRetries) {
                console.warn(`[${taskName}] Attempt ${attempt}/${maxRetries} failed. Retrying in 2 minutes...`);
                console.warn(`Error: ${errorMsg}`);
                
                // Wait 2 minutes before retry
                await sleep(delayMs);
            }
        }
    }

    // All retries failed - log and return null
    logError(taskName, `❌ Failed after ${maxRetries} retries`, 'failed', attempts, lastError);
    return null;
}

/**
 * Log error to file for audit trail
 */
function logError(taskName, status, outcome, attempts, finalError = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        taskName,
        status,
        outcome,
        attempts,
        error: finalError ? finalError.toString() : null
    };

    const logFileName = `${taskName.replace(/\s+/g, '-').toLowerCase()}-errors.jsonl`;
    const logFilePath = path.join(ERROR_LOG_DIR, logFileName);

    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
    console.log(`[Error Log] ${logFileName}: ${outcome}`);
}

/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    retryWithBackoff,
    sleep
};
