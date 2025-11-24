#!/usr/bin/env node

/**
 * Setup Automated Content Checks
 * Configures pre-commit hooks and CI checks for content compliance
 */

const fs = require('fs');
const path = require('path');

const PRE_COMMIT_HOOK = `#!/bin/sh
# Kiro Content Requirements Pre-Commit Hook

echo "🔍 Running content compliance checks..."

# Find staged .tsx and .ts files in src/app
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E 'src/app/.*\\.(tsx|ts)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✓ No content files to check"
  exit 0
fi

# Run validation on each staged file
FAILED=0
for FILE in $STAGED_FILES; do
  echo "Checking: $FILE"
  node scripts/validate-content-requirements.js "$FILE"
  
  if [ $? -ne 0 ]; then
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "❌ Content compliance check failed!"
  echo "Fix the issues above or use 'git commit --no-verify' to skip checks"
  exit 1
fi

echo "✅ All content compliance checks passed"
exit 0
`;

const GITHUB_WORKFLOW = `name: Content Compliance Check

on:
  pull_request:
    paths:
      - 'src/app/**/*.tsx'
      - 'src/app/**/*.ts'
      - 'src/components/**/*.tsx'
  push:
    branches:
      - main
    paths:
      - 'src/app/**/*.tsx'
      - 'src/app/**/*.ts'

jobs:
  content-compliance:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run content compliance audit
        run: node scripts/audit-content-compliance.js
      
      - name: Upload audit results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: content-compliance-report
          path: content-compliance-audit-*.json
      
      - name: Check for violations
        run: |
          REPORT=$(ls -t content-compliance-audit-*.json | head -1)
          NON_COMPLIANT=$(node -p "require('./$REPORT').summary.nonCompliant")
          
          if [ "$NON_COMPLIANT" -gt 0 ]; then
            echo "❌ Content compliance check failed: $NON_COMPLIANT page(s) non-compliant"
            exit 1
          fi
          
          echo "✅ All pages are compliant"
`;

const PACKAGE_JSON_SCRIPTS = {
  "content:audit": "node scripts/audit-content-compliance.js",
  "content:validate": "node scripts/validate-content-requirements.js",
  "content:update": "node scripts/update-page-to-spec.js",
  "content:generate": "node scripts/create-content-from-spec.js",
  "content:check": "npm run content:audit && echo '✅ Content compliance check passed'"
};

const VSCODE_TASKS = {
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Content Compliance",
      "type": "shell",
      "command": "node",
      "args": [
        "scripts/validate-content-requirements.js",
        "${file}"
      ],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Audit All Content",
      "type": "shell",
      "command": "node",
      "args": [
        "scripts/audit-content-compliance.js"
      ],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Update Page to Spec",
      "type": "shell",
      "command": "node",
      "args": [
        "scripts/update-page-to-spec.js",
        "${file}",
        "--dry-run"
      ],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
};

class ContentChecksSetup {
  constructor() {
    this.rootDir = process.cwd();
    this.results = {
      preCommitHook: false,
      githubWorkflow: false,
      packageScripts: false,
      vscodeTasks: false
    };
  }

  async setup() {
    console.log('🔧 Setting up automated content checks...\n');

    this.setupPreCommitHook();
    this.setupGitHubWorkflow();
    this.setupPackageScripts();
    this.setupVSCodeTasks();

    this.printSummary();
  }

  setupPreCommitHook() {
    try {
      const gitDir = path.join(this.rootDir, '.git');
      
      if (!fs.existsSync(gitDir)) {
        console.log('⚠️  Git repository not initialized - skipping pre-commit hook');
        return;
      }

      const hooksDir = path.join(gitDir, 'hooks');
      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const hookPath = path.join(hooksDir, 'pre-commit');
      fs.writeFileSync(hookPath, PRE_COMMIT_HOOK, { mode: 0o755 });

      this.results.preCommitHook = true;
      console.log('✅ Pre-commit hook installed');
    } catch (error) {
      console.error('❌ Failed to setup pre-commit hook:', error.message);
    }
  }

  setupGitHubWorkflow() {
    try {
      const workflowDir = path.join(this.rootDir, '.github', 'workflows');
      
      if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
      }

      const workflowPath = path.join(workflowDir, 'content-compliance.yml');
      fs.writeFileSync(workflowPath, GITHUB_WORKFLOW);

      this.results.githubWorkflow = true;
      console.log('✅ GitHub workflow created');
    } catch (error) {
      console.error('❌ Failed to setup GitHub workflow:', error.message);
    }
  }

  setupPackageScripts() {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        console.log('⚠️  package.json not found - skipping script setup');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Add content scripts
      Object.assign(packageJson.scripts, PACKAGE_JSON_SCRIPTS);

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

      this.results.packageScripts = true;
      console.log('✅ Package.json scripts added');
    } catch (error) {
      console.error('❌ Failed to setup package scripts:', error.message);
    }
  }

  setupVSCodeTasks() {
    try {
      const vscodeDir = path.join(this.rootDir, '.vscode');
      
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }

      const tasksPath = path.join(vscodeDir, 'tasks.json');
      
      let existingTasks = { version: "2.0.0", tasks: [] };
      if (fs.existsSync(tasksPath)) {
        existingTasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
      }

      // Add content tasks if they don't exist
      VSCODE_TASKS.tasks.forEach(newTask => {
        const exists = existingTasks.tasks.some(t => t.label === newTask.label);
        if (!exists) {
          existingTasks.tasks.push(newTask);
        }
      });

      fs.writeFileSync(tasksPath, JSON.stringify(existingTasks, null, 2));

      this.results.vscodeTasks = true;
      console.log('✅ VS Code tasks configured');
    } catch (error) {
      console.error('❌ Failed to setup VS Code tasks:', error.message);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SETUP SUMMARY');
    console.log('='.repeat(60));

    const items = [
      { name: 'Pre-commit hook', status: this.results.preCommitHook },
      { name: 'GitHub workflow', status: this.results.githubWorkflow },
      { name: 'Package scripts', status: this.results.packageScripts },
      { name: 'VS Code tasks', status: this.results.vscodeTasks }
    ];

    items.forEach(item => {
      const icon = item.status ? '✅' : '❌';
      console.log(`${icon} ${item.name}`);
    });

    console.log('='.repeat(60));

    if (this.results.packageScripts) {
      console.log('\n📝 Available npm scripts:');
      Object.keys(PACKAGE_JSON_SCRIPTS).forEach(script => {
        console.log(`  npm run ${script}`);
      });
    }

    console.log('\n💡 Usage:');
    console.log('  • Pre-commit hook runs automatically on git commit');
    console.log('  • GitHub workflow runs on PR and push to main');
    console.log('  • VS Code tasks available via Command Palette');
    console.log('  • Run "npm run content:check" to validate all content');
    console.log('\n');
  }
}

// Run setup
if (require.main === module) {
  const setup = new ContentChecksSetup();
  setup.setup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
}

module.exports = ContentChecksSetup;
