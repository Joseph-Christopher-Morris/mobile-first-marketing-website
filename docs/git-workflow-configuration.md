# Git Workflow Configuration

This document describes the Git workflow settings configured for this project to ensure consistency between local development and CI environments on Windows systems.

## CRLF Normalization Configuration

### Global Configuration
The following Git configuration has been set globally:

```bash
git config --global core.autocrlf true
```

This setting ensures that:
- Line endings are converted to CRLF on checkout (Windows style)
- Line endings are converted to LF on commit (Unix style for repository storage)
- Prevents line ending conflicts between Windows and Unix systems

### Additional Safety Settings
```bash
git config core.safecrlf warn
```

This warns about potentially unsafe CRLF conversions without blocking operations.

## .gitignore Configuration

The `.gitignore` file has been updated to exclude:

### Generated Reports and Test Results
- `*-report-*.json` and `*-report-*.md`
- `*-results-*.json` and `*-results-*.md`
- `*-summary-*.json` and `*-summary-*.md`
- `*-validation-*.json` and `*-validation-*.md`
- `*-monitoring-*.json` and `*-monitoring-*.md`
- `*-test-*.json` and `*-test-*.md`

### Specific Report Types
- `requirements-compliance-*`
- `accessibility-compliance-*`
- `build-consistency-*`
- `build-verification-*`
- `cache-*`
- `comprehensive-*`
- `core-web-vitals-*`
- `cross-browser-*`
- `deployment-*`
- `final-validation-*`
- `image-*`
- `lighthouse-*`
- `local-ci-*`
- `navigation-*`
- `performance-*`
- `pfs-*`
- `testimonials-*`
- `tls-*`

### Build Artifacts and Temporary Files
- `build-*/` (timestamped build directories)
- `test-results/`
- `validation-reports/`
- `lighthouse-reports/`
- `playwright-report/`
- `logs/`
- `reports/`

### Test Files (Temporary)
- `test-*.html`
- `test-*.js`
- `test-*.json`

### Generated Documentation
- Various `*_GUIDE.md`, `*_CHECKLIST*.md`, `*_SUMMARY.md` patterns
- Task implementation summaries
- Deployment and troubleshooting guides

### Windows-Specific Files
- `*.bat` and `*.ps1` scripts (generated)
- `main` file (appears to be generated)

## Safe Git Staging Practices

### Automated Scripts

#### Node.js Script: `scripts/safe-git-staging.js`
```bash
node scripts/safe-git-staging.js [--verbose]
```

Features:
- Configures Git settings for Windows environment
- Safely stages all changes using `git add -A`
- Performs pre-commit checks for large files and sensitive data
- Provides detailed logging and error handling

#### PowerShell Script: `scripts/safe-git-workflow.ps1`
```powershell
.\scripts\safe-git-workflow.ps1 -Action <action> [-Message "commit message"] [-Verbose] [-DryRun]
```

Actions:
- `stage`: Stage all changes safely
- `commit`: Stage and commit with message
- `push`: Push to remote repository
- `full`: Complete workflow (stage, commit, push)

Options:
- `-Verbose`: Show detailed output
- `-DryRun`: Show what would be done without executing

### Manual Safe Staging Commands

For manual Git operations, use these safe commands:

```bash
# Configure Git for Windows (one-time setup)
git config core.autocrlf true
git config core.safecrlf warn

# Check status before staging
git status

# Stage all changes safely (includes deletions)
git add -A

# Review staged changes
git diff --cached

# Commit with descriptive message
git commit -m "Descriptive commit message"

# Push to remote
git push origin main
```

## Best Practices

### Before Committing
1. **Review Changes**: Always use `git diff --cached` to review staged changes
2. **Check File Sizes**: Avoid committing large files (>10MB)
3. **Verify Sensitive Data**: Ensure no secrets, passwords, or API keys are included
4. **Test Locally**: Run `npm run build` to ensure the build works

### Commit Messages
- Use descriptive, present-tense messages
- Reference issue numbers when applicable
- Keep first line under 50 characters
- Add detailed description if needed

### Branch Management
- Work on feature branches for significant changes
- Keep main branch stable and deployable
- Use pull requests for code review

## Troubleshooting

### Common Issues

#### "Nothing added to commit" Warning
This warning appears when trying to commit without staged changes. Use the safe staging scripts or `git add -A` to stage all changes.

#### CRLF Conversion Warnings
If you see CRLF warnings, the `core.autocrlf true` setting should resolve them. For existing files, you may need to:
```bash
git add --renormalize .
git commit -m "Normalize line endings"
```

#### Large File Warnings
If you need to commit large files:
1. Consider if the file is necessary in the repository
2. Use Git LFS for large binary files
3. Compress files if possible
4. Move large files to external storage

#### Permission Denied Errors
On Windows, you may encounter permission issues:
1. Run PowerShell as Administrator
2. Check file permissions
3. Ensure files are not locked by other applications

### Recovery Commands

#### Unstage Changes
```bash
git reset HEAD <file>  # Unstage specific file
git reset HEAD         # Unstage all files
```

#### Discard Changes
```bash
git checkout -- <file>  # Discard changes to specific file
git checkout -- .       # Discard all changes (careful!)
```

#### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

## Integration with CI/CD

The Git workflow configuration ensures consistency with the GitHub Actions CI pipeline:

- Line endings are normalized for cross-platform compatibility
- Generated files are ignored to prevent CI conflicts
- Safe staging practices prevent accidental commits of sensitive data
- Build artifacts are excluded from version control

This configuration supports the Node.js 22.19.0 requirement and ensures smooth operation between Windows development and Linux CI environments.