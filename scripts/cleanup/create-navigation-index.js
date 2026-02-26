#!/usr/bin/env node

/**
 * Navigation Index Creator
 * 
 * Creates docs/README.md navigation index with:
 * - Quick links to protected files
 * - Documentation category descriptions
 * - Date convention explanation
 * - Common tasks reference
 * 
 * Requirements: 6.1-6.6
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Creates docs/README.md navigation index
 * @param {Object} manifest - Categorization manifest with file counts
 * @returns {Promise<{success: boolean, path: string, error?: string}>}
 */
async function createNavigationIndex(manifest = {}) {
  try {
    const indexPath = path.join(process.cwd(), 'docs', 'README.md');
    const content = generateIndexContent(manifest);
    
    // Ensure docs directory exists
    const docsDir = path.dirname(indexPath);
    await fs.mkdir(docsDir, { recursive: true });
    
    // Write navigation index
    await fs.writeFile(indexPath, content, 'utf-8');
    
    console.log(`✓ Navigation index created: ${indexPath}`);
    
    return {
      success: true,
      path: indexPath
    };
  } catch (error) {
    console.error(`✗ Failed to create navigation index: ${error.message}`);
    return {
      success: false,
      path: '',
      error: error.message
    };
  }
}

/**
 * Generates markdown content for navigation index
 * @param {Object} manifest - Categorization manifest with file counts
 * @returns {string} Markdown content
 */
function generateIndexContent(manifest) {
  const content = `# Documentation Navigation

## Quick Links

- [AWS Security Standards](../aws-security-standards.md)
- [Deployment Standards](../deployment-standards.md)
- [Project Deployment Config](../project-deployment-config.md)

## Documentation Categories

### Summaries

Deployment summaries, status reports, and completion documents.

**Examples:** deployment summaries, implementation complete docs, status reports

**Location:** \`summaries/\`

### Audits

Validation reports, test results, and verification documents.

**Examples:** validation reports, test summaries, audit results, verification documents

**Location:** \`audits/\`

### Architecture

Infrastructure guides, architecture documentation, and setup instructions.

**Examples:** AWS guides, CloudFront configuration, infrastructure docs, setup guides

**Location:** \`architecture/\`

### Decisions

Quick references, checklists, and implementation decisions.

**Examples:** quick reference guides, deployment checklists, implementation instructions

**Location:** \`decisions/\`

### Archive

Historical documentation older than 90 days.

**Examples:** outdated deployment summaries, old validation reports, historical guides

**Location:** \`archive/\`

## Date Convention

All files use **YYYY-MM-DD** prefix format for chronological sorting.

**Example:** \`2026-02-22-deployment-summary.md\`

This convention ensures:
- Files are sorted chronologically by default
- Easy identification of document creation dates
- Consistent naming across all documentation

## Common Tasks

### Find a deployment summary
Check the \`summaries/\` folder for deployment-related documents.

### Find a validation report
Check the \`audits/\` folder for validation and test results.

### Find a setup guide
Check the \`architecture/\` folder for infrastructure and setup documentation.

### Find a quick reference
Check the \`decisions/\` folder for checklists and quick guides.

### Find historical documentation
Check the \`archive/\` folder for documents older than 90 days.

## Repository Structure

\`\`\`
docs/
├── README.md           # This navigation index
├── summaries/          # Deployment and status summaries
├── audits/             # Validation reports and test results
├── architecture/       # Infrastructure and design documentation
├── decisions/          # Implementation decisions and quick references
└── archive/            # Historical documentation (>90 days old)
\`\`\`

## Protected Files

The following files remain at the repository root for governance and quick access:

- **aws-security-standards.md** - AWS security requirements and best practices
- **deployment-standards.md** - Deployment architecture and standards
- **project-deployment-config.md** - Current deployment configuration

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

  return content;
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      // Try to load manifest if it exists
      let manifest = {};
      const manifestPath = path.join(__dirname, 'categorization-manifest.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
        console.log('Loaded categorization manifest');
      } catch (error) {
        console.log('No manifest found, creating index without file counts');
      }
      
      const result = await createNavigationIndex(manifest);
      
      if (result.success) {
        console.log('\n✓ Navigation index created successfully');
        process.exit(0);
      } else {
        console.error('\n✗ Navigation index creation failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  createNavigationIndex,
  generateIndexContent
};
