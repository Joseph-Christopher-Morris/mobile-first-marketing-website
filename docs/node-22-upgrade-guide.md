# Node.js 22.19.0 Upgrade Guide

## Overview

This guide provides step-by-step instructions for upgrading your local development environment to Node.js 22.19.0, which is required for compatibility with lighthouse@13 and vite@7.1.7 dependencies.

## Prerequisites

- Administrative access to your Windows machine
- Internet connection for downloading Node.js
- Backup of current project dependencies (optional but recommended)

## Installation Options

### Option 1: Direct Install (Recommended for Most Users)

#### Step 1: Download Node.js 22.19.0
1. Visit the official Node.js website: https://nodejs.org/
2. Navigate to "Previous Releases" or use direct link: https://nodejs.org/dist/v22.19.0/
3. Download the Windows Installer (.msi) for your system:
   - `node-v22.19.0-x64.msi` (64-bit Windows)
   - `node-v22.19.0-x86.msi` (32-bit Windows)

#### Step 2: Install Node.js
1. Run the downloaded .msi installer as Administrator
2. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation directory (default: `C:\Program Files\nodejs\`)
   - Select "Add to PATH" option (should be checked by default)
   - Complete the installation

#### Step 3: Verify Installation
```cmd
node --version
# Should output: v22.19.0

npm --version
# Should output: 10.8.0 or higher
```

### Option 2: Using Corepack (Node.js Built-in Package Manager)

#### Step 1: Enable Corepack
```cmd
# Enable corepack (if Node.js 16.10+ is already installed)
corepack enable

# Install specific Node.js version via corepack
corepack prepare node@22.19.0 --activate
```

#### Step 2: Verify Installation
```cmd
node --version
npm --version
```

### Option 3: Using NVM for Windows (Advanced Users)

#### Step 1: Install NVM for Windows
1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Download `nvm-setup.exe` from the latest release
3. Run the installer as Administrator
4. Restart your command prompt or PowerShell

#### Step 2: Install Node.js 22.19.0
```cmd
# List available Node.js versions
nvm list available

# Install Node.js 22.19.0
nvm install 22.19.0

# Use Node.js 22.19.0 as default
nvm use 22.19.0

# Set as default for new sessions
nvm alias default 22.19.0
```

#### Step 3: Verify Installation
```cmd
nvm current
# Should output: v22.19.0

node --version
npm --version
```

## Quick Verification

After installing Node.js 22.19.0, you can quickly verify your setup using these convenience scripts:

### Windows Command Prompt
```cmd
check-node-setup.bat
```

### Windows PowerShell
```powershell
.\check-node-setup.ps1
```

### Cross-Platform (npm script)
```cmd
npm run node:check
```

## Post-Installation Steps

### 1. Update Project Dependencies
```cmd
# Navigate to your project directory
cd path\to\your\project

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Reinstall dependencies with new Node version
npm install
```

### 2. Verify Project Compatibility
```cmd
# Check for any Node engine warnings
npm ls

# Test build process
npm run build

# Verify no lockfile changes after clean install
git status
# package-lock.json should not show modifications
```

### 3. Update Development Tools (Optional)
```cmd
# Update npm to latest version
npm install -g npm@latest

# Update global packages if needed
npm update -g
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Node version mismatch" errors
**Solution**: Ensure you're using Node.js 22.19.0 exactly:
```cmd
node --version
# Must show v22.19.0
```

#### Issue: npm permissions errors
**Solution**: Run command prompt as Administrator or configure npm prefix:
```cmd
npm config set prefix %APPDATA%\npm
```

#### Issue: PATH not updated after installation
**Solution**: 
1. Restart command prompt/PowerShell
2. Manually add Node.js to PATH:
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\nodejs\` to PATH variable

#### Issue: Package-lock.json changes after npm ci
**Solution**: This indicates version inconsistency. Ensure:
1. Local Node version matches CI (22.19.0)
2. npm version is compatible (≥10.8.0)
3. Clear cache and reinstall: `npm cache clean --force && npm ci`

### Verification Checklist

- [ ] Node.js version is exactly 22.19.0
- [ ] npm version is 10.8.0 or higher
- [ ] `npm ci` runs without errors
- [ ] `npm run build` completes successfully
- [ ] No package-lock.json modifications after clean install
- [ ] GitHub Actions workflow passes (if testing)

## Environment Consistency

### Local vs CI Environment
To ensure consistency between local development and CI:

1. **Node Version**: Must be exactly 22.19.0 in both environments
2. **npm Version**: Should be ≥10.8.0 in both environments
3. **Package Manager**: Use `npm ci` for reproducible installs
4. **Environment Variables**: Set `CI=true` when testing locally

### Testing Local Setup
```cmd
# Test build in CI-like environment
set CI=true
set NEXT_TELEMETRY_DISABLED=1
npm ci
npm run build
```

## Additional Resources

- [Node.js Official Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [NVM for Windows Documentation](https://github.com/coreybutler/nvm-windows)
- [Project GitHub Actions Workflow](.github/workflows/quality-check.yml)

## Support

If you encounter issues not covered in this guide:
1. Check the project's GitHub Actions logs for CI environment details
2. Verify your local setup matches the CI configuration
3. Consult the troubleshooting section above
4. Review the project's package.json engines field for requirements