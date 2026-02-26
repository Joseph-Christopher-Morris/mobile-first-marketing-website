# Documentation Navigation

## Quick Links

- [AWS Security Standards](../aws-security-standards.md)
- [Deployment Standards](../deployment-standards.md)
- [Project Deployment Config](../project-deployment-config.md)

## Documentation Categories

### Summaries

Deployment summaries, status reports, and completion documents.

**Examples:** deployment summaries, implementation complete docs, status reports

**Location:** `summaries/`

### Audits

Validation reports, test results, and verification documents.

**Examples:** validation reports, test summaries, audit results, verification documents

**Location:** `audits/`

### Architecture

Infrastructure guides, architecture documentation, and setup instructions.

**Examples:** AWS guides, CloudFront configuration, infrastructure docs, setup guides

**Location:** `architecture/`

### Decisions

Quick references, checklists, and implementation decisions.

**Examples:** quick reference guides, deployment checklists, implementation instructions

**Location:** `decisions/`

### Archive

Historical documentation older than 90 days.

**Examples:** outdated deployment summaries, old validation reports, historical guides

**Location:** `archive/`

## Date Convention

All files use **YYYY-MM-DD** prefix format for chronological sorting.

**Example:** `2026-02-22-deployment-summary.md`

This convention ensures:
- Files are sorted chronologically by default
- Easy identification of document creation dates
- Consistent naming across all documentation

## Common Tasks

### Find a deployment summary
Check the `summaries/` folder for deployment-related documents.

### Find a validation report
Check the `audits/` folder for validation and test results.

### Find a setup guide
Check the `architecture/` folder for infrastructure and setup documentation.

### Find a quick reference
Check the `decisions/` folder for checklists and quick guides.

### Find historical documentation
Check the `archive/` folder for documents older than 90 days.

## Repository Structure

```
docs/
├── README.md           # This navigation index
├── summaries/          # Deployment and status summaries
├── audits/             # Validation reports and test results
├── architecture/       # Infrastructure and design documentation
├── decisions/          # Implementation decisions and quick references
└── archive/            # Historical documentation (>90 days old)
```

## Protected Files

The following files remain at the repository root for governance and quick access:

- **aws-security-standards.md** - AWS security requirements and best practices
- **deployment-standards.md** - Deployment architecture and standards
- **project-deployment-config.md** - Current deployment configuration

---

*Last updated: 2026-02-26*
