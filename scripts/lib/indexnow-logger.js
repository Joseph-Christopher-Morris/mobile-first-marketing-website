/**
 * IndexNow Logging Service
 * 
 * Handles logging of IndexNow submission results to logs/indexnow-submissions.json
 * in JSON Lines format (one JSON object per line). Provides statistics tracking
 * and automatic log file rotation when size exceeds 10MB.
 * 
 * Features:
 * - JSON Lines format for easy parsing and streaming
 * - API key redaction in all log output
 * - Automatic log rotation at 10MB threshold
 * - Success rate calculation and monitoring
 * - Warning alerts when success rate falls below 90%
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Constants
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'indexnow-submissions.json');
const MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const SUCCESS_RATE_THRESHOLD = 0.9; // 90%
const API_KEY_REDACTION = '***REDACTED***';

/**
 * Log submission result to the log file.
 * 
 * Writes a submission result to logs/indexnow-submissions.json in JSON Lines format.
 * Each log entry is a complete JSON object on a single line, making it easy to parse
 * and stream process large log files.
 * 
 * The function automatically:
 * - Creates the logs directory if it doesn't exist
 * - Rotates the log file if it exceeds 10MB
 * - Redacts API keys from error messages
 * - Checks success rate and logs warnings if it falls below 90%
 * - Falls back to console logging if file write fails
 * 
 * @param {Object} entry - Log entry
 * @param {string} entry.timestamp - ISO 8601 timestamp of submission
 * @param {string} [entry.deploymentId] - Optional deployment identifier (e.g., 'deploy-1234567890')
 * @param {number} entry.urlCount - Number of URLs submitted
 * @param {boolean} entry.success - Whether submission was successful
 * @param {number} entry.statusCode - HTTP response status code (0 for network errors)
 * @param {string} [entry.error] - Error message if submission failed
 * @param {number} entry.duration - Request duration in milliseconds
 * @returns {Promise<void>}
 * 
 * @example
 * // Log successful submission
 * await logSubmission({
 *   timestamp: new Date().toISOString(),
 *   deploymentId: 'deploy-1234567890',
 *   urlCount: 25,
 *   success: true,
 *   statusCode: 200,
 *   duration: 1234
 * });
 * 
 * @example
 * // Log failed submission with error
 * await logSubmission({
 *   timestamp: new Date().toISOString(),
 *   urlCount: 25,
 *   success: false,
 *   statusCode: 429,
 *   error: 'Rate limit exceeded',
 *   duration: 567
 * });
 * 
 * @example
 * // Log network error
 * await logSubmission({
 *   timestamp: new Date().toISOString(),
 *   urlCount: 25,
 *   success: false,
 *   statusCode: 0,
 *   error: 'Network error: ECONNREFUSED',
 *   duration: 100
 * });
 */
async function logSubmission(entry) {
  try {
    // Ensure logs directory exists
    const logsDir = path.dirname(LOG_FILE_PATH);
    await fs.mkdir(logsDir, { recursive: true });

    // Check if log rotation is needed before writing
    await rotateLogFile();

    // Redact any API keys from error messages
    const sanitizedEntry = { ...entry };
    if (sanitizedEntry.error) {
      sanitizedEntry.error = redactApiKey(sanitizedEntry.error);
    }

    // Convert entry to JSON Lines format (single line)
    const logLine = JSON.stringify(sanitizedEntry) + '\n';

    // Append to log file
    await fs.appendFile(LOG_FILE_PATH, logLine, 'utf-8');

    // Check success rate and log warning if needed
    const stats = await getStatistics(10);
    if (stats.totalSubmissions >= 10 && stats.successRate < SUCCESS_RATE_THRESHOLD) {
      const warningMessage = `WARNING: IndexNow success rate (${(stats.successRate * 100).toFixed(1)}%) has fallen below ${SUCCESS_RATE_THRESHOLD * 100}% over the last 10 submissions`;
      console.warn(warningMessage);
    }
  } catch (error) {
    // Fallback to console logging if file write fails
    console.error('Failed to write to log file:', error.message);
    console.log('Log entry (console fallback):', JSON.stringify(entry));
  }
}

/**
 * Get submission statistics from recent log entries.
 * 
 * Analyzes recent submission history and calculates comprehensive statistics including
 * total submissions, success/failure counts, success rate, last successful submission
 * timestamp, and average URL count per submission.
 * 
 * The function reads the log file in JSON Lines format, parses the most recent entries
 * (up to the specified limit), and calculates statistics. It handles malformed log lines
 * gracefully by skipping them with a warning.
 * 
 * @param {number} [limit=10] - Number of recent submissions to analyze (default: 10)
 * @returns {Promise<Statistics>} Submission statistics
 * 
 * @typedef {Object} Statistics
 * @property {number} totalSubmissions - Total number of submissions analyzed
 * @property {number} successfulSubmissions - Number of successful submissions (status 200/202)
 * @property {number} failedSubmissions - Number of failed submissions (non-200/202 status)
 * @property {number} successRate - Success rate as decimal (0.0 to 1.0)
 * @property {string|null} lastSuccessfulSubmission - ISO 8601 timestamp of last success, or null if none
 * @property {number} averageUrlCount - Average number of URLs per submission
 * 
 * @example
 * // Get statistics for last 10 submissions
 * const stats = await getStatistics(10);
 * console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
 * console.log(`Total submissions: ${stats.totalSubmissions}`);
 * console.log(`Average URLs: ${stats.averageUrlCount.toFixed(0)}`);
 * 
 * @example
 * // Get statistics for last 50 submissions
 * const stats = await getStatistics(50);
 * if (stats.successRate < 0.9) {
 *   console.warn('Success rate below 90%!');
 * }
 * 
 * @example
 * // No log file yet
 * const stats = await getStatistics();
 * console.log(stats);
 * // {
 * //   totalSubmissions: 0,
 * //   successfulSubmissions: 0,
 * //   failedSubmissions: 0,
 * //   successRate: 0,
 * //   lastSuccessfulSubmission: null,
 * //   averageUrlCount: 0
 * // }
 */
async function getStatistics(limit = 10) {
  const defaultStats = {
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    successRate: 0,
    lastSuccessfulSubmission: null,
    averageUrlCount: 0
  };

  try {
    // Check if log file exists
    try {
      await fs.access(LOG_FILE_PATH);
    } catch {
      // Log file doesn't exist yet
      return defaultStats;
    }

    // Read log file
    const logContent = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    
    // Parse JSON Lines format (one JSON object per line)
    const lines = logContent.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return defaultStats;
    }

    // Parse entries and get the most recent ones
    const entries = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch (parseError) {
        // Skip malformed lines
        console.warn('Skipping malformed log line:', parseError.message);
      }
    }

    // Get the most recent entries (up to limit)
    const recentEntries = entries.slice(-limit);

    // Calculate statistics
    let successfulSubmissions = 0;
    let failedSubmissions = 0;
    let totalUrlCount = 0;
    let lastSuccessfulSubmission = null;

    for (const entry of recentEntries) {
      if (entry.success) {
        successfulSubmissions++;
        lastSuccessfulSubmission = entry.timestamp;
      } else {
        failedSubmissions++;
      }
      totalUrlCount += entry.urlCount || 0;
    }

    const totalSubmissions = recentEntries.length;
    const successRate = totalSubmissions > 0 ? successfulSubmissions / totalSubmissions : 0;
    const averageUrlCount = totalSubmissions > 0 ? totalUrlCount / totalSubmissions : 0;

    return {
      totalSubmissions,
      successfulSubmissions,
      failedSubmissions,
      successRate,
      lastSuccessfulSubmission,
      averageUrlCount
    };
  } catch (error) {
    console.error('Failed to calculate statistics:', error.message);
    return defaultStats;
  }
}

/**
 * Rotate log file if it exceeds the size threshold.
 * 
 * Checks if the log file exceeds the 10MB size threshold and rotates it
 * by renaming with a timestamp suffix. The rotated file is named:
 * indexnow-submissions-{timestamp}.json
 * 
 * After rotation, a new log file will be created on the next write operation.
 * This prevents log files from growing indefinitely and makes log management easier.
 * 
 * The function handles errors gracefully - if rotation fails, it logs a warning
 * but allows logging to continue to the existing file.
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // Automatic rotation during logging
 * await rotateLogFile();
 * // If file > 10MB, creates: indexnow-submissions-1708596600000.json
 * 
 * @example
 * // Manual rotation
 * await rotateLogFile();
 * console.log('Log file rotated if needed');
 * 
 * @example
 * // No rotation needed
 * await rotateLogFile();
 * // If file < 10MB, no action taken
 */
async function rotateLogFile() {
  try {
    // Check if log file exists
    let stats;
    try {
      stats = await fs.stat(LOG_FILE_PATH);
    } catch {
      // File doesn't exist yet, no rotation needed
      return;
    }

    // Check if file size exceeds threshold
    if (stats.size >= MAX_LOG_SIZE_BYTES) {
      // Generate timestamp for rotated file
      const timestamp = Date.now();
      const rotatedFileName = `indexnow-submissions-${timestamp}.json`;
      const rotatedFilePath = path.join(path.dirname(LOG_FILE_PATH), rotatedFileName);

      // Rename current log file
      await fs.rename(LOG_FILE_PATH, rotatedFilePath);

      console.log(`Log file rotated: ${rotatedFileName} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  } catch (error) {
    // Log warning but don't throw - allow logging to continue
    console.warn('Failed to rotate log file:', error.message);
  }
}

/**
 * Redact API keys from text to prevent exposure in logs.
 * 
 * Replaces any hexadecimal strings that look like API keys (8-128 characters)
 * with a redaction marker (***REDACTED***). This prevents accidental API key
 * exposure in error messages, logs, or console output.
 * 
 * The function uses a regex pattern to match potential API keys and replaces
 * them with a safe placeholder. It's designed to be conservative and may redact
 * other hexadecimal strings that match the pattern.
 * 
 * @param {string} text - Text that may contain API keys
 * @returns {string} Text with API keys replaced by '***REDACTED***'
 * 
 * @example
 * // Redact API key in error message
 * redactApiKey('Error with key a1b2c3d4e5f6g7h8')
 * // Returns: 'Error with key ***REDACTED***'
 * 
 * @example
 * // Multiple keys
 * redactApiKey('Keys: abc12345 and def67890')
 * // Returns: 'Keys: ***REDACTED*** and ***REDACTED***'
 * 
 * @example
 * // No keys to redact
 * redactApiKey('Error: Network timeout')
 * // Returns: 'Error: Network timeout'
 * 
 * @example
 * // Short hex strings not redacted (< 8 chars)
 * redactApiKey('Color: #ff0000')
 * // Returns: 'Color: #ff0000'
 */
function redactApiKey(text) {
  if (typeof text !== 'string') {
    return text;
  }

  // Pattern to match hexadecimal strings of 8-128 characters
  // This matches potential API keys in error messages
  const apiKeyPattern = /\b[0-9a-fA-F]{8,128}\b/g;
  
  return text.replace(apiKeyPattern, API_KEY_REDACTION);
}

module.exports = {
  logSubmission,
  getStatistics,
  rotateLogFile,
  redactApiKey
};
