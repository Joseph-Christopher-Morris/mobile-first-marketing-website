# Node.js 22.19.0 Quick Reference

## Required Version
- **Node.js**: 22.19.0 (exact)
- **npm**: ≥10.8.0

## Quick Install Options

### Option 1: Direct Download
1. Download from: https://nodejs.org/dist/v22.19.0/
2. Install `node-v22.19.0-x64.msi`
3. Verify: `node --version` → v22.19.0

### Option 2: NVM Windows
```cmd
nvm install 22.19.0
nvm use 22.19.0
```

### Option 3: Corepack
```cmd
corepack enable
corepack prepare node@22.19.0 --activate
```

## Post-Install Verification
```cmd
# Clean install dependencies
npm cache clean --force
rmdir /s node_modules & del package-lock.json
npm install

# Verify build works
npm run build

# Check for lockfile changes
git status
```

## Troubleshooting
- **PATH issues**: Restart terminal or add `C:\Program Files\nodejs\` to PATH
- **Permission errors**: Run as Administrator
- **Lockfile changes**: Ensure exact Node version match (22.19.0)

## Quick Verification Scripts

```cmd
# Windows batch file
check-node-setup.bat

# PowerShell
.\check-node-setup.ps1

# npm script (cross-platform)
npm run node:check
```

## CI Consistency Check
```cmd
set CI=true
set NEXT_TELEMETRY_DISABLED=1
npm ci
npm run build
```

Must match GitHub Actions environment exactly.