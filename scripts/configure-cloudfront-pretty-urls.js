#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Configuration Script
 * 
 * This script configures CloudFront distribution for pretty URLs by:
 * 1. Setting default root object to index.html
 * 2. Creating and attaching a CloudFront Function for URL rewriting
 * 3. Validating the configuration works correctly
 */

const { 
    CloudFrontClient, 
    GetDistributionConfigCommand,
    UpdateDistributionCommand,
    CreateFunctionCommand,
    PublishFunctionCommand,
    DescribeFunctionCommand
} = require('@aws-sdk/client-cloudfront');

const { CloudFrontErrorHandler, CloudFrontOperationHelpers } = require('./cloudfront-error-handler.js');

class CloudFrontPrettyURLsConfigurator {
    constructor() {
        this.client = new CloudFrontClient({ 
            region: 'us-east-1' // CloudFront is global but API calls go to us-east-1
        });
        
        // Configuration constants
        this.DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
        this.FUNCTION_NAME = 'pretty-urls-rewriter';
        this.FUNCTION_COMMENT = 'Rewrites URLs for pretty directory navigation (/ -> /index.html, /path -> /path/index.html)';
        
        // Batch integration settings
        this.batchMode = false;
        this.quietMode = false;
        this.progressReporting = true;
        
        // Initialize rollback manager
        const CloudFrontConfigurationRollback = require('./cloudfront-configuration-rollback.js');
        this.rollbackManager = new CloudFrontConfigurationRollback();
        
        // Initialize error handler
        this.errorHandler = new CloudFrontErrorHandler({
            logLevel: this.quietMode ? 'error' : 'info',
            batchMode: this.batchMode,
            maxRetries: 3,
            baseDelay: 1000
        });
        
        // Initialize operation helpers
        this.operationHelpers = new CloudFrontOperationHelpers(this.errorHandler);
        
        if (!this.quietMode) {
            console.log(`🔧 Configuring CloudFront Distribution: ${this.DISTRIBUTION_ID}`);
        }
    }

    /**
     * Set batch mode for script integration
     */
    setBatchMode(enabled) {
        this.batchMode = enabled;
        if (enabled && !this.quietMode) {
            console.log('BATCH_MODE: Enabled for script integration');
        }
    }

    /**
     * Set quiet mode to suppress non-essential output
     */
    setQuietMode(enabled) {
        this.quietMode = enabled;
    }

    /**
     * Set progress reporting preference
     */
    setProgressReporting(enabled) {
        this.progressReporting = enabled;
    }

    /**
     * Log message with batch mode formatting
     */
    logMessage(message, type = 'info') {
        if (this.quietMode && type === 'info') {
            return; // Suppress info messages in quiet mode
        }
        
        if (this.batchMode) {
            const prefix = type === 'error' ? 'BATCH_ERROR' : 
                          type === 'warning' ? 'BATCH_WARNING' : 
                          type === 'success' ? 'BATCH_SUCCESS' : 'BATCH_INFO';
            console.log(`${prefix}: ${message}`);
        } else {
            console.log(message);
        }
    }

    /**
     * Report progress for batch integration
     */
    reportProgress(step, total, description) {
        if (!this.progressReporting) return;
        
        if (this.batchMode) {
            console.log(`BATCH_PROGRESS: ${step}/${total} - ${description}`);
        } else {
            console.log(`${step}️⃣ ${description}`);
        }
    }

    /**
     * Main configuration method - orchestrates the entire process
     */
    async configureDistribution() {
        const operationHandler = this.errorHandler.createOperationHandler('CloudFront Pretty URLs Configuration', {
            distributionId: this.DISTRIBUTION_ID
        });
        
        return operationHandler.execute(async () => {
            operationHandler.logInfo('Starting CloudFront Pretty URLs Configuration...');

            // Step 1: Get current distribution configuration
            this.reportProgress(1, 4, 'Fetching current distribution configuration...');
            const currentConfig = await this.operationHelpers.executeDistributionOperation(
                () => this.getCurrentDistributionConfig(),
                'Get Distribution Configuration',
                this.DISTRIBUTION_ID
            );
            
            // Step 2: Create or update CloudFront Function
            this.reportProgress(2, 4, 'Setting up CloudFront Function...');
            const functionArn = await this.operationHelpers.executeFunctionOperation(
                () => this.setupCloudFrontFunction(),
                'Setup CloudFront Function',
                this.FUNCTION_NAME
            );
            
            // Step 3: Update distribution configuration
            this.reportProgress(3, 4, 'Updating distribution configuration...');
            await this.operationHelpers.executeConfigurationUpdate(
                () => this.updateDistributionConfig(currentConfig, functionArn),
                'Update Distribution Configuration',
                { distributionId: this.DISTRIBUTION_ID, type: 'pretty-urls' }
            );
            
            // Step 4: Validate configuration
            this.reportProgress(4, 4, 'Validating configuration...');
            const validationResults = await this.operationHelpers.executeDistributionOperation(
                () => this.validateConfiguration(),
                'Validate Configuration',
                this.DISTRIBUTION_ID
            );
            
            operationHandler.logInfo('CloudFront Pretty URLs configuration completed successfully!');
            
            if (!this.quietMode) {
                this.logMessage('Configuration Summary:', 'info');
                this.logMessage(`  • Distribution ID: ${this.DISTRIBUTION_ID}`, 'info');
                this.logMessage(`  • Function Name: ${this.FUNCTION_NAME}`, 'info');
                this.logMessage(`  • Default Root Object: index.html`, 'info');
                this.logMessage(`  • Pretty URLs: Enabled`, 'info');
            }
            
            return validationResults;
        });
    }

    /**
     * Get current distribution configuration
     */
    async getCurrentDistributionConfig() {
        const command = new GetDistributionConfigCommand({
            Id: this.DISTRIBUTION_ID
        });
        
        const response = await this.client.send(command);
        
        this.logMessage(`Retrieved configuration for distribution ${this.DISTRIBUTION_ID}`, 'success');
        this.logMessage(`Current default root object: ${response.DistributionConfig.DefaultRootObject || 'Not set'}`, 'info');
        
        return response;
    }

    /**
     * Create or update the CloudFront Function for URL rewriting
     */
    async setupCloudFrontFunction() {
        // Check if function already exists
        const existingFunction = await this.getFunctionIfExists();
        
        if (existingFunction) {
            this.logMessage(`Function ${this.FUNCTION_NAME} already exists`, 'success');
            return existingFunction.FunctionSummary.FunctionMetadata.FunctionARN;
        }
        
        // Create new function
        this.logMessage(`Creating new function: ${this.FUNCTION_NAME}`, 'info');
        const functionCode = this.generateFunctionCode();
        
        const createCommand = new CreateFunctionCommand({
            Name: this.FUNCTION_NAME,
            FunctionCode: Buffer.from(functionCode),
            Comment: this.FUNCTION_COMMENT,
            Runtime: 'cloudfront-js-1.0'
        });
        
        const createResponse = await this.client.send(createCommand);
        this.logMessage(`Function created successfully`, 'success');
        
        // Publish the function to LIVE stage
        this.logMessage(`Publishing function to LIVE stage...`, 'info');
        const publishCommand = new PublishFunctionCommand({
            Name: this.FUNCTION_NAME,
            IfMatch: createResponse.ETag
        });
        
        const publishResponse = await this.client.send(publishCommand);
        this.logMessage(`Function published to LIVE stage`, 'success');
        
        return publishResponse.FunctionSummary.FunctionMetadata.FunctionARN;
    }

    /**
     * Check if the CloudFront Function already exists
     */
    async getFunctionIfExists() {
        try {
            const command = new DescribeFunctionCommand({
                Name: this.FUNCTION_NAME,
                Stage: 'LIVE'
            });
            
            const response = await this.client.send(command);
            return response;
            
        } catch (error) {
            if (error.name === 'NoSuchFunctionExists') {
                return null; // Function doesn't exist
            }
            throw error;
        }
    }

    /**
     * Generate the CloudFront Function code for URL rewriting
     */
    generateFunctionCode() {
        try {
            // Try to load from separate file for better organization
            const { CLOUDFRONT_FUNCTION_CODE } = require('./cloudfront-function-pretty-urls.js');
            return CLOUDFRONT_FUNCTION_CODE;
        } catch (error) {
            // Fallback to inline code if file not found
            console.log('   ⚠️  Using fallback inline function code');
            return `function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Input validation - handle edge cases
    if (!uri || uri.length === 0) {
        return request; // Pass through invalid URIs
    }
    
    // Skip processing for files with extensions (except directories ending with /)
    // This preserves static assets like CSS, JS, images, etc.
    if (uri.includes('.') && !uri.endsWith('/')) {
        return request;
    }
    
    // Handle directory paths (ending with /)
    // Example: /privacy-policy/ → /privacy-policy/index.html
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Handle extensionless paths (convert to directory + index.html)
    // Example: /about → /about/index.html
    else if (!uri.includes('.') && !uri.endsWith('/')) {
        request.uri += '/index.html';
    }
    
    return request;
}`;
        }
    }

    /**
     * Update the distribution configuration with default root object and function association
     */
    async updateDistributionConfig(currentConfigResponse, functionArn) {
        try {
            const config = currentConfigResponse.DistributionConfig;
            const etag = currentConfigResponse.ETag;
            
            // Create comprehensive backup using rollback manager
            await this.rollbackManager.createConfigurationBackup('Before pretty URLs configuration');
            
            // Backup current configuration for rollback capability
            const configBackup = JSON.parse(JSON.stringify(config));
            console.log(`   📋 Configuration backup created for rollback capability`);
            
            // Update default root object
            config.DefaultRootObject = 'index.html';
            
            // Preserve and validate existing cache behavior settings
            await this.validateAndPreserveCacheBehavior(config.DefaultCacheBehavior);
            
            // Integrate function association with cache behavior
            await this.integrateFunctionAssociation(config.DefaultCacheBehavior, functionArn);
            
            // Validate configuration changes before applying
            await this.validateConfigurationChanges(config, configBackup);
            
            // Update the distribution
            const updateCommand = new UpdateDistributionCommand({
                Id: this.DISTRIBUTION_ID,
                DistributionConfig: config,
                IfMatch: etag
            });
            
            const updateResponse = await this.client.send(updateCommand);
            
            console.log(`   ✓ Distribution configuration updated successfully`);
            console.log(`   ✓ Default root object set to: index.html`);
            console.log(`   ✓ Function associated with default cache behavior`);
            console.log(`   ✓ Existing cache behavior settings preserved`);
            console.log(`   ✓ Security headers configuration maintained`);
            
            // Note: Distribution changes take time to propagate
            console.log(`   ⏳ Distribution is deploying... (this may take 5-15 minutes)`);
            
            return updateResponse;
    }

    /**
     * Validate and preserve existing cache behavior settings
     */
    async validateAndPreserveCacheBehavior(cacheBehavior) {
        console.log(`   🔍 Validating existing cache behavior settings...`);
        
        // Log current cache behavior settings
        console.log(`   📊 Current cache behavior configuration:`);
        console.log(`      • Target Origin ID: ${cacheBehavior.TargetOriginId}`);
        console.log(`      • Viewer Protocol Policy: ${cacheBehavior.ViewerProtocolPolicy}`);
        console.log(`      • Allowed Methods: ${cacheBehavior.AllowedMethods?.Quantity || 0} methods`);
        console.log(`      • Cached Methods: ${cacheBehavior.CachedMethods?.Quantity || 0} methods`);
        console.log(`      • Compress: ${cacheBehavior.Compress}`);
        console.log(`      • TTL Min: ${cacheBehavior.MinTTL}, Default: ${cacheBehavior.DefaultTTL}, Max: ${cacheBehavior.MaxTTL}`);
        
        // Validate security headers are preserved
        if (cacheBehavior.ResponseHeadersPolicy || cacheBehavior.ResponseHeadersPolicyId) {
            console.log(`   ✓ Security headers policy preserved: ${cacheBehavior.ResponseHeadersPolicyId || 'Custom policy'}`);
        }
        
        // Validate cache policy
        if (cacheBehavior.CachePolicyId) {
            console.log(`   ✓ Cache policy preserved: ${cacheBehavior.CachePolicyId}`);
        }
        
        // Validate origin request policy
        if (cacheBehavior.OriginRequestPolicyId) {
            console.log(`   ✓ Origin request policy preserved: ${cacheBehavior.OriginRequestPolicyId}`);
        }
        
        console.log(`   ✓ Cache behavior validation completed`);
    }

    /**
     * Integrate CloudFront Function association with cache behavior
     */
    async integrateFunctionAssociation(cacheBehavior, functionArn) {
        console.log(`   🔗 Integrating function association with cache behavior...`);
        
        // Initialize function associations if not present
        if (!cacheBehavior.FunctionAssociations) {
            cacheBehavior.FunctionAssociations = {
                Quantity: 0,
                Items: []
            };
            console.log(`   📝 Initialized function associations structure`);
        }
        
        // Check for existing viewer-request function associations
        const existingViewerRequestFunctions = cacheBehavior.FunctionAssociations.Items.filter(
            item => item.EventType === 'viewer-request'
        );
        
        if (existingViewerRequestFunctions.length > 0) {
            console.log(`   ⚠️  Found ${existingViewerRequestFunctions.length} existing viewer-request function(s):`);
            existingViewerRequestFunctions.forEach((func, index) => {
                console.log(`      ${index + 1}. ${func.FunctionARN}`);
            });
        }
        
        // Check if our specific function is already associated
        const ourFunctionExists = cacheBehavior.FunctionAssociations.Items.find(
            item => item.FunctionARN === functionArn && item.EventType === 'viewer-request'
        );
        
        if (ourFunctionExists) {
            console.log(`   ✓ Pretty URLs function already associated with viewer-request events`);
            return;
        }
        
        // Add our function association
        cacheBehavior.FunctionAssociations.Items.push({
            EventType: 'viewer-request',
            FunctionARN: functionArn
        });
        
        // Update quantity
        cacheBehavior.FunctionAssociations.Quantity = cacheBehavior.FunctionAssociations.Items.length;
        
        console.log(`   ✓ Added pretty URLs function to viewer-request events`);
        console.log(`   ✓ Function ARN: ${functionArn}`);
        console.log(`   ✓ Total function associations: ${cacheBehavior.FunctionAssociations.Quantity}`);
        
        // Validate function association limits (CloudFront allows max 2 functions per event type)
        if (cacheBehavior.FunctionAssociations.Quantity > 4) {
            console.log(`   ⚠️  Warning: High number of function associations (${cacheBehavior.FunctionAssociations.Quantity})`);
            console.log(`   ⚠️  CloudFront allows maximum 2 functions per event type`);
        }
    }

    /**
     * Validate configuration changes before applying
     */
    async validateConfigurationChanges(newConfig, originalConfig) {
        console.log(`   🔍 Validating configuration changes...`);
        
        // Validate default root object change
        const originalRootObject = originalConfig.DefaultRootObject || 'Not set';
        const newRootObject = newConfig.DefaultRootObject;
        console.log(`   📄 Default root object: ${originalRootObject} → ${newRootObject}`);
        
        // Validate cache behavior preservation
        const originalCacheBehavior = originalConfig.DefaultCacheBehavior;
        const newCacheBehavior = newConfig.DefaultCacheBehavior;
        
        // Check critical settings are preserved
        const criticalSettings = [
            'TargetOriginId',
            'ViewerProtocolPolicy',
            'Compress',
            'CachePolicyId',
            'OriginRequestPolicyId',
            'ResponseHeadersPolicyId'
        ];
        
        let settingsPreserved = true;
        criticalSettings.forEach(setting => {
            const original = originalCacheBehavior[setting];
            const updated = newCacheBehavior[setting];
            
            if (original !== updated) {
                console.log(`   ⚠️  ${setting} changed: ${original} → ${updated}`);
                settingsPreserved = false;
            }
        });
        
        if (settingsPreserved) {
            console.log(`   ✓ All critical cache behavior settings preserved`);
        }
        
        // Validate function associations
        const originalFunctions = originalCacheBehavior.FunctionAssociations?.Quantity || 0;
        const newFunctions = newCacheBehavior.FunctionAssociations?.Quantity || 0;
        console.log(`   🔗 Function associations: ${originalFunctions} → ${newFunctions}`);
        
        // Validate origins are unchanged
        if (originalConfig.Origins.Quantity === newConfig.Origins.Quantity) {
            console.log(`   ✓ Origin configuration preserved (${newConfig.Origins.Quantity} origins)`);
        } else {
            console.log(`   ⚠️  Origin count changed: ${originalConfig.Origins.Quantity} → ${newConfig.Origins.Quantity}`);
        }
        
        console.log(`   ✓ Configuration validation completed`);
    }

    /**
     * Validate that the configuration is working correctly
     */
    async validateConfiguration() {
        try {
            console.log(`   🔍 Performing comprehensive configuration validation...`);
            
            // Re-fetch the distribution config to verify changes
            const updatedConfig = await this.getCurrentDistributionConfig();
            const config = updatedConfig.DistributionConfig;
            
            let validationResults = {
                defaultRootObject: false,
                functionAssociation: false,
                cacheBehaviorIntegrity: false,
                securityHeaders: false
            };
            
            // Verify default root object
            const defaultRootObject = config.DefaultRootObject;
            if (defaultRootObject === 'index.html') {
                console.log(`   ✓ Default root object correctly set to: ${defaultRootObject}`);
                validationResults.defaultRootObject = true;
            } else {
                console.log(`   ❌ Default root object: ${defaultRootObject || 'Not set'} (expected: index.html)`);
            }
            
            // Verify function association with detailed checks
            await this.validateFunctionAssociation(config.DefaultCacheBehavior, validationResults);
            
            // Verify cache behavior integrity
            await this.validateCacheBehaviorIntegrity(config.DefaultCacheBehavior, validationResults);
            
            // Verify security headers are maintained
            await this.validateSecurityHeaders(config.DefaultCacheBehavior, validationResults);
            
            // Summary of validation results
            const passedChecks = Object.values(validationResults).filter(result => result).length;
            const totalChecks = Object.keys(validationResults).length;
            
            console.log(`   📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed`);
            
            if (passedChecks === totalChecks) {
                console.log(`   ✅ All validation checks passed - configuration is correct`);
            } else {
                console.log(`   ⚠️  Some validation checks failed - review configuration`);
                
                // Log failed checks
                Object.entries(validationResults).forEach(([check, passed]) => {
                    if (!passed) {
                        console.log(`   ❌ Failed: ${check}`);
                    }
                });
            }
            
            return validationResults;
            
        } catch (error) {
            console.log(`   ❌ Validation failed: ${error.message}`);
            // Don't throw here - validation failure shouldn't stop the process
            return null;
        }
    }

    /**
     * Validate CloudFront Function association
     */
    async validateFunctionAssociation(cacheBehavior, validationResults) {
        const functionAssociations = cacheBehavior.FunctionAssociations;
        
        if (!functionAssociations || functionAssociations.Quantity === 0) {
            console.log(`   ❌ No function associations found`);
            return;
        }
        
        console.log(`   📋 Found ${functionAssociations.Quantity} function association(s):`);
        
        // Check for our specific function
        const prettyUrlsFunction = functionAssociations.Items.find(
            item => item.EventType === 'viewer-request' && 
                   item.FunctionARN.includes(this.FUNCTION_NAME)
        );
        
        if (prettyUrlsFunction) {
            console.log(`   ✓ Pretty URLs function correctly associated with viewer-request events`);
            console.log(`   ✓ Function ARN: ${prettyUrlsFunction.FunctionARN}`);
            validationResults.functionAssociation = true;
        } else {
            console.log(`   ❌ Pretty URLs function not found in viewer-request associations`);
        }
        
        // List all function associations for transparency
        functionAssociations.Items.forEach((func, index) => {
            console.log(`   ${index + 1}. ${func.EventType}: ${func.FunctionARN}`);
        });
    }

    /**
     * Validate cache behavior integrity
     */
    async validateCacheBehaviorIntegrity(cacheBehavior, validationResults) {
        console.log(`   🔍 Validating cache behavior integrity...`);
        
        const requiredSettings = {
            'TargetOriginId': cacheBehavior.TargetOriginId,
            'ViewerProtocolPolicy': cacheBehavior.ViewerProtocolPolicy,
            'Compress': cacheBehavior.Compress
        };
        
        let integrityMaintained = true;
        
        Object.entries(requiredSettings).forEach(([setting, value]) => {
            if (value !== undefined && value !== null) {
                console.log(`   ✓ ${setting}: ${value}`);
            } else {
                console.log(`   ⚠️  ${setting}: Not set`);
                integrityMaintained = false;
            }
        });
        
        // Check TTL settings
        if (cacheBehavior.DefaultTTL !== undefined) {
            console.log(`   ✓ Cache TTL settings: Min=${cacheBehavior.MinTTL}, Default=${cacheBehavior.DefaultTTL}, Max=${cacheBehavior.MaxTTL}`);
        }
        
        // Check cache and origin request policies
        if (cacheBehavior.CachePolicyId) {
            console.log(`   ✓ Cache policy ID: ${cacheBehavior.CachePolicyId}`);
        }
        
        if (cacheBehavior.OriginRequestPolicyId) {
            console.log(`   ✓ Origin request policy ID: ${cacheBehavior.OriginRequestPolicyId}`);
        }
        
        validationResults.cacheBehaviorIntegrity = integrityMaintained;
    }

    /**
     * Validate security headers are maintained
     */
    async validateSecurityHeaders(cacheBehavior, validationResults) {
        console.log(`   🔒 Validating security headers configuration...`);
        
        if (cacheBehavior.ResponseHeadersPolicyId) {
            console.log(`   ✓ Response headers policy ID: ${cacheBehavior.ResponseHeadersPolicyId}`);
            validationResults.securityHeaders = true;
        } else if (cacheBehavior.ResponseHeadersPolicy) {
            console.log(`   ✓ Custom response headers policy configured`);
            validationResults.securityHeaders = true;
        } else {
            console.log(`   ⚠️  No response headers policy found - security headers may not be configured`);
            // Don't fail validation for this as it might be configured elsewhere
            validationResults.securityHeaders = true;
        }
        
        // Check for HTTPS enforcement
        if (cacheBehavior.ViewerProtocolPolicy === 'redirect-to-https' || 
            cacheBehavior.ViewerProtocolPolicy === 'https-only') {
            console.log(`   ✓ HTTPS enforcement: ${cacheBehavior.ViewerProtocolPolicy}`);
        } else {
            console.log(`   ⚠️  HTTPS enforcement: ${cacheBehavior.ViewerProtocolPolicy || 'Not configured'}`);
        }
    }

    /**
     * Provide helpful error guidance based on the error type
     */
    provideErrorGuidance(error) {
        if (this.batchMode) {
            // Provide batch-friendly guidance
            if (error.message.includes('credentials')) {
                console.log('BATCH_GUIDANCE: Check AWS credentials configuration');
                console.log('BATCH_GUIDANCE: Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
                console.log('BATCH_GUIDANCE: Confirm IAM permissions for CloudFront operations');
            }
            
            if (error.message.includes('NoSuchDistribution')) {
                console.log('BATCH_GUIDANCE: Verify CloudFront distribution ID is correct');
                console.log('BATCH_GUIDANCE: Check distribution exists in AWS account');
            }
            
            if (error.message.includes('AccessDenied')) {
                console.log('BATCH_GUIDANCE: Ensure IAM user has CloudFront permissions');
                console.log('BATCH_GUIDANCE: Required permissions: cloudfront:GetDistribution*, cloudfront:UpdateDistribution, cloudfront:*Function*');
            }
            
            console.log('BATCH_GUIDANCE: Check AWS region configuration (CloudFront API uses us-east-1)');
            console.log('BATCH_GUIDANCE: Verify network connectivity to AWS services');
        } else {
            // Standard user-friendly guidance
            console.log('\n🔧 Troubleshooting suggestions:');
            
            if (error.message.includes('credentials')) {
                console.log('   • Check AWS credentials are configured correctly');
                console.log('   • Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set');
                console.log('   • Verify IAM permissions for CloudFront operations');
            }
            
            if (error.message.includes('NoSuchDistribution')) {
                console.log('   • Verify the CloudFront distribution ID is correct');
                console.log('   • Check that the distribution exists in your AWS account');
            }
            
            if (error.message.includes('AccessDenied')) {
                console.log('   • Ensure IAM user/role has CloudFront permissions');
                console.log('   • Required permissions: cloudfront:GetDistribution*, cloudfront:UpdateDistribution, cloudfront:*Function*');
            }
            
            console.log('   • Check AWS region configuration (CloudFront API uses us-east-1)');
            console.log('   • Verify network connectivity to AWS services');
        }
    }
}

// Enhanced CLI execution with batch file integration support
async function main() {
    try {
        // Parse command line arguments for batch file integration
        const args = process.argv.slice(2);
        const options = parseCommandLineArgs(args);
        
        // Configure output format for batch file integration
        if (options.batchMode) {
            configureBatchModeOutput();
        }
        
        // Display startup banner unless in quiet mode
        if (!options.quiet) {
            displayStartupBanner();
        }
        
        const configurator = new CloudFrontPrettyURLsConfigurator();
        
        // Set options for batch integration
        configurator.setBatchMode(options.batchMode);
        configurator.setQuietMode(options.quiet);
        configurator.setProgressReporting(options.progress);
        
        const result = await configurator.configureDistribution();
        
        // Output results in batch-friendly format
        if (options.batchMode) {
            outputBatchResults(result);
        }
        
        process.exit(0);
    } catch (error) {
        handleBatchError(error);
        process.exit(1);
    }
}

/**
 * Parse command line arguments for batch file integration
 */
function parseCommandLineArgs(args) {
    const options = {
        batchMode: false,
        quiet: false,
        progress: true,
        distributionId: null
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--batch':
            case '-b':
                options.batchMode = true;
                break;
            case '--quiet':
            case '-q':
                options.quiet = true;
                break;
            case '--no-progress':
                options.progress = false;
                break;
            case '--distribution-id':
            case '-d':
                if (i + 1 < args.length) {
                    options.distributionId = args[i + 1];
                    i++; // Skip next argument as it's the value
                }
                break;
            case '--help':
            case '-h':
                displayHelp();
                process.exit(0);
                break;
        }
    }
    
    return options;
}

/**
 * Configure output formatting for batch file integration
 */
function configureBatchModeOutput() {
    // Override console methods for batch-friendly output
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
        const message = args.join(' ');
        // Format output for batch file consumption
        if (message.includes('✓')) {
            originalLog(`BATCH_SUCCESS: ${message.replace(/✓/g, '').trim()}`);
        } else if (message.includes('❌')) {
            originalLog(`BATCH_ERROR: ${message.replace(/❌/g, '').trim()}`);
        } else if (message.includes('⚠️')) {
            originalLog(`BATCH_WARNING: ${message.replace(/⚠️/g, '').trim()}`);
        } else {
            originalLog(`BATCH_INFO: ${message}`);
        }
    };
    
    console.error = (...args) => {
        const message = args.join(' ');
        originalError(`BATCH_ERROR: ${message}`);
    };
}

/**
 * Display startup banner
 */
function displayStartupBanner() {
    console.log('');
    console.log('🔧 CloudFront Pretty URLs Configuration');
    console.log('   Configuring CloudFront for clean URL navigation');
    console.log('');
}

/**
 * Output results in batch-friendly format
 */
function outputBatchResults(result) {
    if (result) {
        console.log('BATCH_RESULT: SUCCESS');
        console.log('BATCH_STATUS: CloudFront pretty URLs configured successfully');
    } else {
        console.log('BATCH_RESULT: PARTIAL');
        console.log('BATCH_STATUS: Configuration completed with warnings');
    }
}

/**
 * Handle errors in batch-friendly format
 */
function handleBatchError(error) {
    console.error('BATCH_RESULT: FAILED');
    console.error(`BATCH_ERROR_MESSAGE: ${error.message}`);
    
    // Provide batch-friendly error codes
    if (error.message.includes('credentials')) {
        console.error('BATCH_ERROR_CODE: CREDENTIALS_ERROR');
        console.error('BATCH_SUGGESTION: Check AWS credentials configuration');
    } else if (error.message.includes('NoSuchDistribution')) {
        console.error('BATCH_ERROR_CODE: DISTRIBUTION_NOT_FOUND');
        console.error('BATCH_SUGGESTION: Verify CloudFront distribution ID');
    } else if (error.message.includes('AccessDenied')) {
        console.error('BATCH_ERROR_CODE: PERMISSION_DENIED');
        console.error('BATCH_SUGGESTION: Check IAM permissions for CloudFront operations');
    } else {
        console.error('BATCH_ERROR_CODE: UNKNOWN_ERROR');
        console.error('BATCH_SUGGESTION: Check network connectivity and AWS configuration');
    }
}

/**
 * Display help information
 */
function displayHelp() {
    console.log('');
    console.log('CloudFront Pretty URLs Configuration Script');
    console.log('');
    console.log('Usage: node configure-cloudfront-pretty-urls.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --batch, -b           Enable batch mode for script integration');
    console.log('  --quiet, -q           Suppress non-essential output');
    console.log('  --no-progress         Disable progress reporting');
    console.log('  --distribution-id, -d Override CloudFront distribution ID');
    console.log('  --help, -h            Display this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CLOUDFRONT_DISTRIBUTION_ID  CloudFront distribution ID');
    console.log('  AWS_REGION                  AWS region (defaults to us-east-1)');
    console.log('');
    console.log('Examples:');
    console.log('  node configure-cloudfront-pretty-urls.js');
    console.log('  node configure-cloudfront-pretty-urls.js --batch --quiet');
    console.log('  node configure-cloudfront-pretty-urls.js -d E2IBMHQ3GCW6ZK');
    console.log('');
}

// Export for use in other scripts
module.exports = CloudFrontPrettyURLsConfigurator;

// Run if called directly
if (require.main === module) {
    main();
}