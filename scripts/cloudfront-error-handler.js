#!/usr/bin/env node

/**
 * CloudFront Error Handler Module
 * 
 * This module provides comprehensive error handling for CloudFront operations:
 * 1. Detailed error logging for all CloudFront operations
 * 2. Retry logic with exponential backoff for API failures
 * 3. User-friendly error messages with remediation steps
 * 4. Error categorization and specific handling strategies
 */

const fs = require('fs').promises;
const path = require('path');

class CloudFrontErrorHandler {
    constructor(options = {}) {
        this.logLevel = options.logLevel || 'info';
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000; // 1 second
        this.maxDelay = options.maxDelay || 30000; // 30 seconds
        this.logFile = options.logFile || path.join(process.cwd(), 'logs', 'cloudfront-errors.log');
        this.batchMode = options.batchMode || false;
        
        // Ensure logs directory exists
        this.ensureLogDirectory();
        
        // Error categories for specific handling
        this.errorCategories = {
            AUTHENTICATION: 'authentication',
            AUTHORIZATION: 'authorization',
            RESOURCE_NOT_FOUND: 'resource_not_found',
            RATE_LIMIT: 'rate_limit',
            VALIDATION: 'validation',
            NETWORK: 'network',
            CONFIGURATION: 'configuration',
            UNKNOWN: 'unknown'
        };
        
        // Retry strategies by error category
        this.retryStrategies = {
            [this.errorCategories.RATE_LIMIT]: { retryable: true, backoff: 'exponential' },
            [this.errorCategories.NETWORK]: { retryable: true, backoff: 'exponential' },
            [this.errorCategories.AUTHENTICATION]: { retryable: false, backoff: 'none' },
            [this.errorCategories.AUTHORIZATION]: { retryable: false, backoff: 'none' },
            [this.errorCategories.RESOURCE_NOT_FOUND]: { retryable: false, backoff: 'none' },
            [this.errorCategories.VALIDATION]: { retryable: false, backoff: 'none' },
            [this.errorCategories.CONFIGURATION]: { retryable: false, backoff: 'none' },
            [this.errorCategories.UNKNOWN]: { retryable: true, backoff: 'linear' }
        };
    }

    /**
     * Execute operation with comprehensive error handling and retry logic
     */
    async executeWithRetry(operation, operationName, context = {}) {
        let lastError;
        let attempt = 0;
        
        while (attempt <= this.maxRetries) {
            try {
                this.logOperation(`Executing ${operationName}`, 'info', { attempt: attempt + 1, context });
                
                const result = await operation();
                
                if (attempt > 0) {
                    this.logOperation(`${operationName} succeeded after ${attempt + 1} attempts`, 'info', { context });
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                attempt++;
                
                const errorCategory = this.categorizeError(error);
                const retryStrategy = this.retryStrategies[errorCategory];
                
                this.logError(error, operationName, {
                    attempt,
                    category: errorCategory,
                    retryable: retryStrategy.retryable,
                    context
                });
                
                // Check if we should retry
                if (attempt <= this.maxRetries && retryStrategy.retryable) {
                    const delay = this.calculateDelay(attempt, retryStrategy.backoff);
                    
                    this.logOperation(
                        `Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries + 1})`,
                        'warn',
                        { delay, errorCategory, context }
                    );
                    
                    await this.sleep(delay);
                } else {
                    // No more retries or not retryable
                    break;
                }
            }
        }
        
        // All retries exhausted or error not retryable
        const enhancedError = this.enhanceError(lastError, operationName, context);
        this.logFinalError(enhancedError, operationName, attempt, context);
        
        throw enhancedError;
    }

    /**
     * Categorize error for appropriate handling
     */
    categorizeError(error) {
        const errorName = error.name || '';
        const errorMessage = error.message || '';
        const errorCode = error.$metadata?.httpStatusCode || error.statusCode || 0;
        
        // Authentication errors
        if (errorName.includes('Credential') || 
            errorMessage.includes('credentials') ||
            errorMessage.includes('authentication') ||
            errorCode === 401) {
            return this.errorCategories.AUTHENTICATION;
        }
        
        // Authorization errors
        if (errorName === 'AccessDenied' || 
            errorMessage.includes('AccessDenied') ||
            errorMessage.includes('permission') ||
            errorCode === 403) {
            return this.errorCategories.AUTHORIZATION;
        }
        
        // Resource not found errors
        if (errorName === 'NoSuchDistribution' ||
            errorName === 'NoSuchFunctionExists' ||
            errorMessage.includes('not found') ||
            errorCode === 404) {
            return this.errorCategories.RESOURCE_NOT_FOUND;
        }
        
        // Rate limiting errors
        if (errorName === 'TooManyRequests' ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('throttle') ||
            errorCode === 429) {
            return this.errorCategories.RATE_LIMIT;
        }
        
        // Validation errors
        if (errorName === 'InvalidArgument' ||
            errorName === 'ValidationException' ||
            errorName === 'PreconditionFailed' ||
            errorMessage.includes('validation') ||
            errorMessage.includes('invalid') ||
            errorCode === 400 ||
            errorCode === 412) {
            return this.errorCategories.VALIDATION;
        }
        
        // Network errors
        if (errorName.includes('Network') ||
            errorName.includes('Timeout') ||
            errorMessage.includes('network') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('connection') ||
            errorCode >= 500) {
            return this.errorCategories.NETWORK;
        }
        
        // Configuration errors
        if (errorMessage.includes('configuration') ||
            errorMessage.includes('distribution') ||
            errorMessage.includes('function')) {
            return this.errorCategories.CONFIGURATION;
        }
        
        return this.errorCategories.UNKNOWN;
    }

    /**
     * Calculate delay for retry with backoff strategy
     */
    calculateDelay(attempt, backoffType) {
        let delay;
        
        switch (backoffType) {
            case 'exponential':
                delay = Math.min(this.baseDelay * Math.pow(2, attempt - 1), this.maxDelay);
                break;
            case 'linear':
                delay = Math.min(this.baseDelay * attempt, this.maxDelay);
                break;
            default:
                delay = this.baseDelay;
        }
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        return Math.floor(delay + jitter);
    }

    /**
     * Enhance error with additional context and remediation steps
     */
    enhanceError(error, operationName, context) {
        const errorCategory = this.categorizeError(error);
        const remediationSteps = this.getRemediationSteps(error, errorCategory);
        
        const enhancedError = new Error(error.message);
        enhancedError.name = error.name;
        enhancedError.originalError = error;
        enhancedError.operationName = operationName;
        enhancedError.category = errorCategory;
        enhancedError.context = context;
        enhancedError.remediationSteps = remediationSteps;
        enhancedError.timestamp = new Date().toISOString();
        
        // Preserve original stack trace
        if (error.stack) {
            enhancedError.stack = error.stack;
        }
        
        return enhancedError;
    }

    /**
     * Get remediation steps for specific error types
     */
    getRemediationSteps(error, category) {
        const steps = [];
        
        switch (category) {
            case this.errorCategories.AUTHENTICATION:
                steps.push('Verify AWS credentials are configured correctly');
                steps.push('Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
                steps.push('Ensure AWS profile is set up if using AWS CLI');
                steps.push('Verify credentials have not expired');
                break;
                
            case this.errorCategories.AUTHORIZATION:
                steps.push('Verify IAM user/role has required CloudFront permissions');
                steps.push('Required permissions: cloudfront:GetDistribution*, cloudfront:UpdateDistribution, cloudfront:*Function*');
                steps.push('Check if MFA is required for the operation');
                steps.push('Verify the AWS account has access to the CloudFront distribution');
                break;
                
            case this.errorCategories.RESOURCE_NOT_FOUND:
                if (error.message.includes('distribution')) {
                    steps.push('Verify the CloudFront distribution ID is correct');
                    steps.push('Check that the distribution exists in your AWS account');
                    steps.push('Ensure you are using the correct AWS region/account');
                } else if (error.message.includes('function')) {
                    steps.push('Verify the CloudFront Function name is correct');
                    steps.push('Check if the function exists in the correct stage (DEVELOPMENT/LIVE)');
                }
                break;
                
            case this.errorCategories.RATE_LIMIT:
                steps.push('Wait before retrying the operation');
                steps.push('Reduce the frequency of API calls');
                steps.push('Implement exponential backoff in your retry logic');
                steps.push('Consider using AWS SDK built-in retry mechanisms');
                break;
                
            case this.errorCategories.VALIDATION:
                if (error.name === 'PreconditionFailed') {
                    steps.push('The distribution configuration was modified by another process');
                    steps.push('Retry the operation to get the latest ETag');
                    steps.push('Ensure no other processes are modifying the distribution');
                } else {
                    steps.push('Verify all required parameters are provided');
                    steps.push('Check parameter formats and values');
                    steps.push('Review CloudFront API documentation for parameter requirements');
                }
                break;
                
            case this.errorCategories.NETWORK:
                steps.push('Check internet connectivity');
                steps.push('Verify DNS resolution for AWS endpoints');
                steps.push('Check firewall and proxy settings');
                steps.push('Retry the operation after a short delay');
                break;
                
            case this.errorCategories.CONFIGURATION:
                steps.push('Review the CloudFront distribution configuration');
                steps.push('Verify all required settings are properly configured');
                steps.push('Check for conflicting configuration options');
                steps.push('Consult CloudFront documentation for configuration requirements');
                break;
                
            default:
                steps.push('Review the error message for specific details');
                steps.push('Check AWS service status for any ongoing issues');
                steps.push('Consult AWS CloudFront documentation');
                steps.push('Contact AWS support if the issue persists');
        }
        
        return steps;
    }

    /**
     * Log operation details
     */
    logOperation(message, level, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            type: 'OPERATION',
            message,
            metadata
        };
        
        this.writeLog(logEntry);
        
        if (this.shouldDisplayLog(level)) {
            this.displayLog(logEntry);
        }
    }

    /**
     * Log error details
     */
    logError(error, operationName, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            type: 'ERROR',
            operationName,
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.$metadata?.httpStatusCode || error.statusCode,
            metadata
        };
        
        this.writeLog(logEntry);
        
        if (this.shouldDisplayLog('error')) {
            this.displayErrorLog(logEntry);
        }
    }

    /**
     * Log final error after all retries exhausted
     */
    logFinalError(error, operationName, attempts, context) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'FATAL',
            type: 'FINAL_ERROR',
            operationName,
            errorName: error.name,
            errorMessage: error.message,
            category: error.category,
            attempts,
            context,
            remediationSteps: error.remediationSteps
        };
        
        this.writeLog(logEntry);
        
        if (this.shouldDisplayLog('error')) {
            this.displayFinalErrorLog(logEntry);
        }
    }

    /**
     * Display operation log to console
     */
    displayLog(logEntry) {
        const prefix = this.batchMode ? `BATCH_${logEntry.level}` : this.getLogIcon(logEntry.level);
        console.log(`${prefix}: ${logEntry.message}`);
        
        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0 && !this.batchMode) {
            console.log(`   Metadata:`, logEntry.metadata);
        }
    }

    /**
     * Display error log to console
     */
    displayErrorLog(logEntry) {
        const prefix = this.batchMode ? 'BATCH_ERROR' : '❌';
        console.error(`${prefix}: ${logEntry.operationName} failed - ${logEntry.errorMessage}`);
        
        if (!this.batchMode && logEntry.metadata.attempt) {
            console.error(`   Attempt: ${logEntry.metadata.attempt}/${this.maxRetries + 1}`);
            console.error(`   Category: ${logEntry.metadata.category}`);
        }
    }

    /**
     * Display final error log with remediation steps
     */
    displayFinalErrorLog(logEntry) {
        const prefix = this.batchMode ? 'BATCH_FATAL' : '💥';
        console.error(`${prefix}: ${logEntry.operationName} failed after ${logEntry.attempts} attempts`);
        console.error(`   Error: ${logEntry.errorMessage}`);
        console.error(`   Category: ${logEntry.category}`);
        
        if (logEntry.remediationSteps && logEntry.remediationSteps.length > 0) {
            if (this.batchMode) {
                logEntry.remediationSteps.forEach((step, index) => {
                    console.error(`BATCH_REMEDIATION_${index + 1}: ${step}`);
                });
            } else {
                console.error(`\n🔧 Remediation Steps:`);
                logEntry.remediationSteps.forEach((step, index) => {
                    console.error(`   ${index + 1}. ${step}`);
                });
            }
        }
    }

    /**
     * Get log icon for display
     */
    getLogIcon(level) {
        const icons = {
            'INFO': 'ℹ️',
            'WARN': '⚠️',
            'ERROR': '❌',
            'FATAL': '💥',
            'DEBUG': '🐛'
        };
        
        return icons[level.toUpperCase()] || 'ℹ️';
    }

    /**
     * Check if log should be displayed based on log level
     */
    shouldDisplayLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevelIndex = levels.indexOf(this.logLevel.toLowerCase());
        const messageLevelIndex = levels.indexOf(level.toLowerCase());
        
        return messageLevelIndex >= currentLevelIndex;
    }

    /**
     * Write log entry to file
     */
    async writeLog(logEntry) {
        try {
            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.appendFile(this.logFile, logLine);
        } catch (error) {
            // Don't throw here to avoid infinite recursion
            console.warn(`Failed to write to log file: ${error.message}`);
        }
    }

    /**
     * Ensure log directory exists
     */
    async ensureLogDirectory() {
        try {
            const logDir = path.dirname(this.logFile);
            await fs.access(logDir);
        } catch (error) {
            try {
                await fs.mkdir(path.dirname(this.logFile), { recursive: true });
            } catch (mkdirError) {
                console.warn(`Failed to create log directory: ${mkdirError.message}`);
            }
        }
    }

    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create error handler for specific operation context
     */
    createOperationHandler(operationName, context = {}) {
        return {
            execute: async (operation) => {
                return this.executeWithRetry(operation, operationName, context);
            },
            
            logInfo: (message, metadata = {}) => {
                this.logOperation(message, 'info', { ...context, ...metadata });
            },
            
            logWarn: (message, metadata = {}) => {
                this.logOperation(message, 'warn', { ...context, ...metadata });
            },
            
            logError: (error, metadata = {}) => {
                this.logError(error, operationName, { ...context, ...metadata });
            }
        };
    }
}

// Utility functions for common CloudFront operations
class CloudFrontOperationHelpers {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Safely execute CloudFront distribution operations
     */
    async executeDistributionOperation(operation, operationName, distributionId) {
        const context = { distributionId };
        const handler = this.errorHandler.createOperationHandler(operationName, context);
        
        return handler.execute(async () => {
            handler.logInfo(`Starting ${operationName} for distribution ${distributionId}`);
            const result = await operation();
            handler.logInfo(`Completed ${operationName} successfully`);
            return result;
        });
    }

    /**
     * Safely execute CloudFront function operations
     */
    async executeFunctionOperation(operation, operationName, functionName) {
        const context = { functionName };
        const handler = this.errorHandler.createOperationHandler(operationName, context);
        
        return handler.execute(async () => {
            handler.logInfo(`Starting ${operationName} for function ${functionName}`);
            const result = await operation();
            handler.logInfo(`Completed ${operationName} successfully`);
            return result;
        });
    }

    /**
     * Safely execute configuration update operations
     */
    async executeConfigurationUpdate(operation, operationName, config) {
        const context = { 
            distributionId: config.distributionId,
            configType: config.type || 'unknown'
        };
        const handler = this.errorHandler.createOperationHandler(operationName, context);
        
        return handler.execute(async () => {
            handler.logInfo(`Starting ${operationName}`, { configType: config.type });
            const result = await operation();
            handler.logInfo(`Configuration update completed successfully`);
            return result;
        });
    }
}

module.exports = {
    CloudFrontErrorHandler,
    CloudFrontOperationHelpers
};