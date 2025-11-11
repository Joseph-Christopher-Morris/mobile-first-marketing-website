#!/usr/bin/env node

/**
 * CloudFront Function Management Utility
 * 
 * This script provides utilities for managing CloudFront Functions:
 * - Create, update, delete functions
 * - Manage function stages (DEVELOPMENT, LIVE)
 * - Test function execution
 * - Monitor function performance
 */

const { 
    CloudFrontClient,
    CreateFunctionCommand,
    UpdateFunctionCommand,
    DeleteFunctionCommand,
    GetFunctionCommand,
    DescribeFunctionCommand,
    PublishFunctionCommand,
    TestFunctionCommand,
    ListFunctionsCommand
} = require('@aws-sdk/client-cloudfront');

class CloudFrontFunctionManager {
    constructor() {
        this.client = new CloudFrontClient({ 
            region: 'us-east-1' // CloudFront is global but API calls go to us-east-1
        });
    }

    /**
     * Create a new CloudFront Function
     */
    async createFunction(name, code, comment = '') {
        try {
            console.log(`📝 Creating CloudFront Function: ${name}`);
            
            const command = new CreateFunctionCommand({
                Name: name,
                FunctionCode: Buffer.from(code),
                Comment: comment,
                Runtime: 'cloudfront-js-1.0'
            });
            
            const response = await this.client.send(command);
            
            console.log(`   ✅ Function created successfully`);
            console.log(`   📋 Function ARN: ${response.FunctionSummary.FunctionMetadata.FunctionARN}`);
            console.log(`   🏷️  ETag: ${response.ETag}`);
            
            return response;
            
        } catch (error) {
            if (error.name === 'FunctionAlreadyExists') {
                console.log(`   ⚠️  Function ${name} already exists`);
                return await this.getFunction(name, 'DEVELOPMENT');
            }
            throw new Error(`Failed to create function: ${error.message}`);
        }
    }

    /**
     * Update an existing CloudFront Function
     */
    async updateFunction(name, code, comment = '') {
        try {
            console.log(`🔄 Updating CloudFront Function: ${name}`);
            
            // Get current function to get ETag
            const currentFunction = await this.getFunction(name, 'DEVELOPMENT');
            
            const command = new UpdateFunctionCommand({
                Name: name,
                FunctionCode: Buffer.from(code),
                Comment: comment,
                IfMatch: currentFunction.ETag
            });
            
            const response = await this.client.send(command);
            
            console.log(`   ✅ Function updated successfully`);
            console.log(`   🏷️  New ETag: ${response.ETag}`);
            
            return response;
            
        } catch (error) {
            throw new Error(`Failed to update function: ${error.message}`);
        }
    }

    /**
     * Get CloudFront Function details
     */
    async getFunction(name, stage = 'LIVE') {
        try {
            const command = new GetFunctionCommand({
                Name: name,
                Stage: stage
            });
            
            const response = await this.client.send(command);
            return response;
            
        } catch (error) {
            if (error.name === 'NoSuchFunctionExists') {
                return null;
            }
            throw new Error(`Failed to get function: ${error.message}`);
        }
    }

    /**
     * Describe CloudFront Function (metadata only)
     */
    async describeFunction(name, stage = 'LIVE') {
        try {
            const command = new DescribeFunctionCommand({
                Name: name,
                Stage: stage
            });
            
            const response = await this.client.send(command);
            return response;
            
        } catch (error) {
            if (error.name === 'NoSuchFunctionExists') {
                return null;
            }
            throw new Error(`Failed to describe function: ${error.message}`);
        }
    }

    /**
     * Publish function from DEVELOPMENT to LIVE stage
     */
    async publishFunction(name) {
        try {
            console.log(`📤 Publishing function ${name} to LIVE stage...`);
            
            // Get development version to get ETag
            const devFunction = await this.getFunction(name, 'DEVELOPMENT');
            if (!devFunction) {
                throw new Error(`Function ${name} not found in DEVELOPMENT stage`);
            }
            
            const command = new PublishFunctionCommand({
                Name: name,
                IfMatch: devFunction.ETag
            });
            
            const response = await this.client.send(command);
            
            console.log(`   ✅ Function published to LIVE stage successfully`);
            console.log(`   📋 Function ARN: ${response.FunctionSummary.FunctionMetadata.FunctionARN}`);
            
            return response;
            
        } catch (error) {
            throw new Error(`Failed to publish function: ${error.message}`);
        }
    }

    /**
     * Test CloudFront Function with sample event
     */
    async testFunction(name, testEvent, stage = 'DEVELOPMENT') {
        try {
            console.log(`🧪 Testing function ${name} in ${stage} stage...`);
            
            const command = new TestFunctionCommand({
                Name: name,
                Stage: stage,
                EventObject: Buffer.from(JSON.stringify(testEvent))
            });
            
            const response = await this.client.send(command);
            
            console.log(`   ✅ Function test completed`);
            console.log(`   📊 Compute utilization: ${response.TestResult.ComputeUtilization}%`);
            console.log(`   ⏱️  Function execution time: ${response.TestResult.FunctionExecutionTime}ms`);
            
            if (response.TestResult.FunctionOutput) {
                const output = JSON.parse(response.TestResult.FunctionOutput.toString());
                console.log(`   📤 Function output:`, output);
            }
            
            if (response.TestResult.FunctionErrorMessage) {
                console.log(`   ❌ Function error: ${response.TestResult.FunctionErrorMessage}`);
            }
            
            return response;
            
        } catch (error) {
            throw new Error(`Failed to test function: ${error.message}`);
        }
    }

    /**
     * List all CloudFront Functions
     */
    async listFunctions() {
        try {
            console.log(`📋 Listing CloudFront Functions...`);
            
            const command = new ListFunctionsCommand({
                Stage: 'LIVE'
            });
            
            const response = await this.client.send(command);
            
            if (response.FunctionList.Items.length === 0) {
                console.log(`   📭 No functions found`);
                return response;
            }
            
            console.log(`   📊 Found ${response.FunctionList.Items.length} functions:`);
            
            response.FunctionList.Items.forEach((func, index) => {
                console.log(`   ${index + 1}. ${func.Name}`);
                console.log(`      📋 ARN: ${func.FunctionMetadata.FunctionARN}`);
                console.log(`      📅 Created: ${func.FunctionMetadata.CreatedTime}`);
                console.log(`      📝 Comment: ${func.Comment || 'No comment'}`);
                console.log('');
            });
            
            return response;
            
        } catch (error) {
            throw new Error(`Failed to list functions: ${error.message}`);
        }
    }

    /**
     * Delete CloudFront Function
     */
    async deleteFunction(name) {
        try {
            console.log(`🗑️  Deleting CloudFront Function: ${name}`);
            
            // Get function to get ETag
            const func = await this.getFunction(name, 'DEVELOPMENT');
            if (!func) {
                console.log(`   ⚠️  Function ${name} not found`);
                return;
            }
            
            const command = new DeleteFunctionCommand({
                Name: name,
                IfMatch: func.ETag
            });
            
            await this.client.send(command);
            
            console.log(`   ✅ Function deleted successfully`);
            
        } catch (error) {
            throw new Error(`Failed to delete function: ${error.message}`);
        }
    }

    /**
     * Create or update function (convenience method)
     */
    async createOrUpdateFunction(name, code, comment = '') {
        const existingFunction = await this.getFunction(name, 'DEVELOPMENT');
        
        if (existingFunction) {
            return await this.updateFunction(name, code, comment);
        } else {
            return await this.createFunction(name, code, comment);
        }
    }

    /**
     * Deploy function (create/update + publish)
     */
    async deployFunction(name, code, comment = '') {
        try {
            console.log(`🚀 Deploying CloudFront Function: ${name}`);
            
            // Create or update in DEVELOPMENT stage
            await this.createOrUpdateFunction(name, code, comment);
            
            // Test the function
            const testEvent = {
                version: '1.0',
                context: {
                    requestId: 'test-request-id'
                },
                viewer: {
                    ip: '192.0.2.1'
                },
                request: {
                    method: 'GET',
                    uri: '/privacy-policy/',
                    headers: {},
                    cookies: {},
                    querystring: {}
                }
            };
            
            await this.testFunction(name, testEvent, 'DEVELOPMENT');
            
            // Publish to LIVE stage
            const publishResponse = await this.publishFunction(name);
            
            console.log(`🎉 Function deployment completed successfully!`);
            return publishResponse;
            
        } catch (error) {
            throw new Error(`Failed to deploy function: ${error.message}`);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.log(`
CloudFront Function Manager

Usage:
  node cloudfront-function-manager.js <command> [options]

Commands:
  list                          List all functions
  create <name> <file>         Create function from file
  update <name> <file>         Update function from file
  deploy <name> <file>         Deploy function (create/update + publish)
  test <name>                  Test function with sample event
  delete <name>                Delete function
  describe <name>              Get function details

Examples:
  node cloudfront-function-manager.js list
  node cloudfront-function-manager.js deploy pretty-urls-rewriter ./cloudfront-function-pretty-urls.js
  node cloudfront-function-manager.js test pretty-urls-rewriter
        `);
        process.exit(1);
    }
    
    const manager = new CloudFrontFunctionManager();
    
    try {
        switch (command) {
            case 'list':
                await manager.listFunctions();
                break;
                
            case 'create':
            case 'update':
            case 'deploy':
                const name = args[1];
                const file = args[2];
                
                if (!name || !file) {
                    console.error('❌ Function name and file path required');
                    process.exit(1);
                }
                
                const fs = require('fs');
                const { CLOUDFRONT_FUNCTION_CODE } = require(`./${file}`);
                const code = CLOUDFRONT_FUNCTION_CODE || fs.readFileSync(file, 'utf8');
                
                if (command === 'create') {
                    await manager.createFunction(name, code);
                } else if (command === 'update') {
                    await manager.updateFunction(name, code);
                } else {
                    await manager.deployFunction(name, code);
                }
                break;
                
            case 'test':
                const testName = args[1];
                if (!testName) {
                    console.error('❌ Function name required');
                    process.exit(1);
                }
                
                const testEvent = {
                    version: '1.0',
                    context: { requestId: 'test-request-id' },
                    viewer: { ip: '192.0.2.1' },
                    request: {
                        method: 'GET',
                        uri: '/privacy-policy/',
                        headers: {},
                        cookies: {},
                        querystring: {}
                    }
                };
                
                await manager.testFunction(testName, testEvent);
                break;
                
            case 'delete':
                const deleteName = args[1];
                if (!deleteName) {
                    console.error('❌ Function name required');
                    process.exit(1);
                }
                await manager.deleteFunction(deleteName);
                break;
                
            case 'describe':
                const describeName = args[1];
                if (!describeName) {
                    console.error('❌ Function name required');
                    process.exit(1);
                }
                const details = await manager.describeFunction(describeName);
                if (details) {
                    console.log('📋 Function Details:');
                    console.log(JSON.stringify(details.FunctionSummary, null, 2));
                } else {
                    console.log('❌ Function not found');
                }
                break;
                
            default:
                console.error(`❌ Unknown command: ${command}`);
                process.exit(1);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error(`❌ Command failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = CloudFrontFunctionManager;

// Run if called directly
if (require.main === module) {
    main();
}