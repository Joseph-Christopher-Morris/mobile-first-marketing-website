# CI Fixes Troubleshooting Guide

This guide provides step-by-step troubleshooting for common issues related to GitHub Actions CI workflow failures and Node.js version consistency problems.

## Quick Diagnosis

Run these commands to quickly identify issues:

```bash
# Check Node version consistency
node scripts/check-node-version-consistency.js

# Test commit workflow
node scripts/test-commit-workflow.js

# Validate CI fixes
node scripts/validate-ci-fixes.js
```

## Common Issues and Solutions

### 1. GitHub Actions Workflow Failures

#### Issue: Node Engine Mismatch Errors

**Symptoms:**
- CI fails with "The engine 'node' is incompatible with this module"
- Lighthouse or Vite installation fails
- Error messages mentioning Node version requirements

**Diagnosis:**
```bash
# Check current workflow configuration
cat .github/workflows/quality-check.yml | grep -A 5 "setup-node"

# Check package.json engines
cat package.json | grep -A 5 "engines"
```

**Solution:**
1. Update GitHub Actions workflow to use Node 22.19.0:
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '22.19.0'
       cache: 'npm'
   ```

2. Update package.json engines field:
   ```json
   {
     "engines": {
       "node": ">=22.19.0",
       "npm": ">=10.8.0"
     }
   }
   ```

3. Test the fix:
   ```bash
   node scripts/test-commit-workflow.js
   ```

#### Issue: Lockfile Inconsistency Warnings

**Symptoms:**
- "npm WARN package-lock.json" messages
- CI fails during `npm ci`
- Different behavior between local and CI builds

**Diagnosis:**
```bash
# Test lockfile consistency
npm ci --dry-run

# Check for lockfile modifications
git status package-lock.json
```

**Solution:**
1. Fix lockfile inconsistencies:
   ```bash
   # Delete node_modules and lockfile
   rm -rf node_modules package-lock.json
   
   # Clean install
   npm install
   
   # Verify consistency
   npm ci --dry-run
   ```

2. Commit the fixed lockfile:
   ```bash
   git add package-lock.json
   git commit -m "fix: resolve lockfile inconsistencies"
   ```

### 2. Local Development Environment Issues

#### Issue: Local Node Version Mismatch

**Symptoms:**
- Different behavior between local and CI builds
- Dependency installation warnings
- Build failures that don't occur in CI

**Diagnosis:**
```bash
# Check current Node version
node --version

# Check npm version
npm --version

# Check package.json requirements
node scripts/check-node-version-consistency.js
```

**Solution Options:**

**Option A: Using nvm-windows (Recommended)**
```bash
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows
# Then install Node 22.19.0
nvm install 22.19.0
nvm use 22.19.0
```

**Option B: Using corepack (if available)**
```bash
# Enable corepack
corepack enable

# Use specific Node version
corepack use node@22.19.0
```

**Option C: Direct Installation**
1. Download Node.js 22.19.0 from https://nodejs.org
2. Install and verify:
   ```bash
   node --version  # Should show v22.19.0
   npm --version   # Should show 10.8.0 or later
   ```

#### Issue: Git Workflow Problems

**Symptoms:**
- "nothing added to commit" warnings
- Unexpected file modifications
- CRLF line ending conflicts

**Diagnosis:**
```bash
# Check Git configuration
git config --list | grep autocrlf

# Check for unstaged changes
git status --porcelain

# Check line ending configuration
git config core.autocrlf
```

**Solution:**
1. Configure CRLF normalization:
   ```bash
   git config --global core.autocrlf true
   ```

2. Use safe staging practices:
   ```bash
   # Stage all changes safely
   git add -A
   
   # Check what will be committed
   git status
   
   # Commit with descriptive message
   git commit -m "descriptive commit message"
   ```

3. Update .gitignore if needed:
   ```bash
   # Add common patterns to .gitignore
   echo "*.tmp" >> .gitignore
   echo "requirements-compliance-*.json" >> .gitignore
   echo "requirements-compliance-*.md" >> .gitignore
   ```

### 3. Dependency Compatibility Issues

#### Issue: Lighthouse Version Conflicts

**Symptoms:**
- Lighthouse installation fails
- Version conflict errors during npm install
- CI fails on lighthouse-related steps

**Diagnosis:**
```bash
# Check lighthouse version
npm list lighthouse

# Check for conflicts
npm ls --depth=0 | grep lighthouse
```

**Solution:**
1. Update to compatible lighthouse version:
   ```bash
   npm install --save-dev lighthouse@^13.0.0
   ```

2. Verify compatibility:
   ```bash
   node scripts/check-node-version-consistency.js
   ```

#### Issue: Vite Version Conflicts

**Symptoms:**
- Vite build failures
- Version mismatch errors
- Development server won't start

**Diagnosis:**
```bash
# Check vite version
npm list vite

# Test build process
npm run build
```

**Solution:**
1. Update to compatible Vite version:
   ```bash
   npm install --save-dev vite@^7.1.7
   ```

2. Test the build:
   ```bash
   npm run build
   npm run dev  # Test development server
   ```

### 4. Build Process Issues

#### Issue: Build Failures in CI

**Symptoms:**
- Local builds work, CI builds fail
- Environment variable issues
- Missing dependencies in CI

**Diagnosis:**
```bash
# Test build locally with CI environment
CI=true npm run build

# Check environment variables
env | grep -E "(NODE_ENV|CI|NEXT_)"
```

**Solution:**
1. Update CI workflow environment variables:
   ```yaml
   env:
     CI: true
     NODE_ENV: production
     NEXT_TELEMETRY_DISABLED: 1
   ```

2. Test build process:
   ```bash
   # Test with CI environment locally
   CI=true NEXT_TELEMETRY_DISABLED=1 npm run build
   ```

## Validation Procedures

### Complete Validation Checklist

Run these steps to validate all CI fixes:

1. **Node Version Consistency:**
   ```bash
   node scripts/check-node-version-consistency.js
   ```

2. **Lockfile Integrity:**
   ```bash
   npm ci --dry-run
   ```

3. **Build Process:**
   ```bash
   npm run build
   ```

4. **Test Commit Workflow:**
   ```bash
   node scripts/test-commit-workflow.js
   ```

5. **Manual GitHub Actions Check:**
   - Go to repository Actions tab
   - Verify latest workflow runs are successful
   - Check for Node version warnings in logs

### Emergency Rollback Procedures

If CI fixes cause issues:

1. **Revert Workflow Changes:**
   ```bash
   git checkout HEAD~1 -- .github/workflows/quality-check.yml
   git commit -m "revert: rollback workflow changes"
   ```

2. **Revert Package.json Changes:**
   ```bash
   git checkout HEAD~1 -- package.json package-lock.json
   npm install
   git add package-lock.json
   git commit -m "revert: rollback package changes"
   ```

3. **Emergency Bypass:**
   Add `[skip ci]` to commit messages to bypass CI temporarily:
   ```bash
   git commit -m "emergency fix [skip ci]"
   ```

## Monitoring and Maintenance

### Regular Health Checks

Run weekly:
```bash
# Check Node version consistency
node scripts/check-node-version-consistency.js

# Validate lockfile
npm audit
npm ci --dry-run

# Test workflow
node scripts/test-commit-workflow.js
```

### Updating Dependencies

When updating Node.js or dependencies:

1. Update package.json engines field
2. Update GitHub Actions workflow
3. Test locally with new versions
4. Run validation scripts
5. Create test commit to verify CI

### Troubleshooting Resources

- **GitHub Actions Logs:** Repository → Actions → Select workflow run
- **Node.js Compatibility:** https://nodejs.org/en/about/releases/
- **npm Documentation:** https://docs.npmjs.com/
- **Lighthouse Requirements:** https://github.com/GoogleChrome/lighthouse

## Getting Help

If issues persist:

1. **Check Logs:**
   - GitHub Actions workflow logs
   - Local npm debug logs (`npm config set loglevel verbose`)

2. **Validate Environment:**
   ```bash
   node --version
   npm --version
   git --version
   ```

3. **Create Minimal Reproduction:**
   - Fresh repository clone
   - Clean npm install
   - Document exact error messages

4. **Common Commands for Support:**
   ```bash
   # Environment info
   node --version && npm --version && git --version
   
   # Package info
   npm list --depth=0
   
   # Git status
   git status && git log --oneline -5
   
   # Workflow status
   gh run list --limit 5  # if GitHub CLI available
   ```

Remember: Always test changes in a separate branch before applying to main branch.