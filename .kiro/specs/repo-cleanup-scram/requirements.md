# Requirements Document: Repository Cleanup and Organization

## Introduction

This feature implements a systematic repository cleanup workflow for a Next.js marketing website with S3 + CloudFront deployment. The repository has accumulated numerous documentation files, deployment summaries, validation reports, and scripts at the root level and scattered across folders. This cleanup will organize documentation into a searchable structure, consolidate scripts into logical categories, and improve overall repository navigation without breaking any runtime functionality.

## Glossary

- **Repository_Cleanup_System**: The automated workflow that organizes documentation and scripts
- **Documentation_Organizer**: Component that categorizes and moves documentation files
- **Script_Consolidator**: Component that groups scripts by purpose
- **Protected_Files**: Governance files that must remain at root level
- **Generated_Folders**: Build artifacts and temporary directories that must not be modified
- **Runtime_Folders**: Source code and configuration directories that must not be modified
- **Git_Safe_Operations**: File moves using git mv to preserve history
- **Date_Convention**: YYYY-MM-DD format for file naming
- **Navigation_Index**: Central README.md that maps documentation locations

## Requirements

### Requirement 1: Create Organized Folder Structure

**User Story:** As a developer, I want a clear folder structure for documentation and scripts, so that I can find information quickly without searching through hundreds of root-level files.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL create a docs/summaries directory for deployment and status summaries
2. THE Repository_Cleanup_System SHALL create a docs/audits directory for validation reports and test results
3. THE Repository_Cleanup_System SHALL create a docs/architecture directory for infrastructure and design documentation
4. THE Repository_Cleanup_System SHALL create a docs/decisions directory for implementation decisions and quick references
5. THE Repository_Cleanup_System SHALL create a docs/archive directory for historical documentation
6. THE Repository_Cleanup_System SHALL create a scripts/fixes directory for bug fix and correction scripts
7. THE Repository_Cleanup_System SHALL create a scripts/migrations directory for one-time migration and setup scripts
8. THE Repository_Cleanup_System SHALL create a scripts/utilities directory for reusable utility scripts

### Requirement 2: Move Documentation Files Safely

**User Story:** As a developer, I want documentation files moved using git-safe operations, so that I can preserve file history and track changes over time.

#### Acceptance Criteria

1. WHEN moving a documentation file, THE Documentation_Organizer SHALL use git mv command
2. THE Documentation_Organizer SHALL move deployment summary files to docs/summaries
3. THE Documentation_Organizer SHALL move validation reports to docs/audits
4. THE Documentation_Organizer SHALL move infrastructure guides to docs/architecture
5. THE Documentation_Organizer SHALL move quick reference files to docs/decisions
6. THE Documentation_Organizer SHALL move files older than 90 days to docs/archive
7. THE Documentation_Organizer SHALL preserve Protected_Files at root level (aws-security-standards.md, deployment-standards.md, project-deployment-config.md)

### Requirement 3: Rename Files with Date Convention

**User Story:** As a developer, I want files renamed with consistent date prefixes, so that I can quickly identify when documentation was created and find related files chronologically.

#### Acceptance Criteria

1. WHEN a file contains a date in its name, THE Documentation_Organizer SHALL extract the date
2. THE Documentation_Organizer SHALL format dates as YYYY-MM-DD
3. THE Documentation_Organizer SHALL prefix filenames with Date_Convention followed by purpose and topic
4. WHEN a file has no date, THE Documentation_Organizer SHALL use file modification timestamp
5. THE Documentation_Organizer SHALL preserve file extensions during renaming
6. FOR ALL renamed files, the new name SHALL follow pattern: YYYY-MM-DD-purpose-topic.ext

### Requirement 4: Consolidate Scripts by Category

**User Story:** As a developer, I want scripts organized by their purpose, so that I can find the right script for deployment, fixes, or utilities without searching through 300+ files.

#### Acceptance Criteria

1. THE Script_Consolidator SHALL move bug fix scripts to scripts/fixes
2. THE Script_Consolidator SHALL move deployment scripts containing "deploy" to scripts/migrations
3. THE Script_Consolidator SHALL move setup and infrastructure scripts to scripts/migrations
4. THE Script_Consolidator SHALL move validation and testing scripts to scripts/utilities
5. THE Script_Consolidator SHALL move monitoring and health check scripts to scripts/utilities
6. THE Script_Consolidator SHALL preserve scripts/lib directory structure
7. WHEN a script is referenced in package.json, THE Script_Consolidator SHALL update the path reference

### Requirement 5: Protect Critical Files and Folders

**User Story:** As a developer, I want critical files and runtime folders protected from modification, so that the build process and deployment pipeline continue to work after cleanup.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL NOT modify files in node_modules directory
2. THE Repository_Cleanup_System SHALL NOT modify files in out directory
3. THE Repository_Cleanup_System SHALL NOT modify files in build-* directories
4. THE Repository_Cleanup_System SHALL NOT modify files in playwright-report directory
5. THE Repository_Cleanup_System SHALL NOT modify files in test-results directory
6. THE Repository_Cleanup_System SHALL NOT modify files in temp-build directory
7. THE Repository_Cleanup_System SHALL NOT modify files in temp-privacy directory
8. THE Repository_Cleanup_System SHALL NOT modify files in src directory
9. THE Repository_Cleanup_System SHALL NOT modify files in config directory
10. THE Repository_Cleanup_System SHALL NOT modify files in public directory
11. THE Repository_Cleanup_System SHALL preserve aws-security-standards.md at root
12. THE Repository_Cleanup_System SHALL preserve deployment-standards.md at root
13. THE Repository_Cleanup_System SHALL preserve project-deployment-config.md at root

### Requirement 6: Create Navigation Index

**User Story:** As a developer, I want a central navigation index, so that I can quickly locate documentation categories and understand the repository structure.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL create docs/README.md as Navigation_Index
2. THE Navigation_Index SHALL list all documentation subdirectories with descriptions
3. THE Navigation_Index SHALL provide examples of file types in each category
4. THE Navigation_Index SHALL include a quick reference section for common tasks
5. THE Navigation_Index SHALL link to Protected_Files at root level
6. THE Navigation_Index SHALL include a section explaining the Date_Convention

### Requirement 7: Validate Build Process Integrity

**User Story:** As a developer, I want the build process validated after cleanup, so that I can confirm no runtime dependencies were broken.

#### Acceptance Criteria

1. WHEN cleanup is complete, THE Repository_Cleanup_System SHALL execute npm run build
2. IF build fails, THEN THE Repository_Cleanup_System SHALL report which files may have broken dependencies
3. THE Repository_Cleanup_System SHALL verify out directory is created successfully
4. THE Repository_Cleanup_System SHALL verify all expected static files are generated
5. IF build succeeds, THEN THE Repository_Cleanup_System SHALL report cleanup as successful

### Requirement 8: Validate Deployment Path Dependencies

**User Story:** As a developer, I want deployment scripts validated after cleanup, so that I can confirm the deployment pipeline still functions correctly.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL scan all deployment scripts for hardcoded paths
2. WHEN a deployment script references a moved file, THE Repository_Cleanup_System SHALL update the path
3. THE Repository_Cleanup_System SHALL verify scripts/deploy.js references are intact
4. THE Repository_Cleanup_System SHALL verify GitHub Actions workflow paths are correct
5. THE Repository_Cleanup_System SHALL verify package.json script paths are updated

### Requirement 9: Create Clean Git Commits

**User Story:** As a developer, I want cleanup changes committed in logical chunks, so that I can review changes easily and rollback specific categories if needed.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL create separate commits for folder structure creation
2. THE Repository_Cleanup_System SHALL create separate commits for documentation moves
3. THE Repository_Cleanup_System SHALL create separate commits for script consolidation
4. THE Repository_Cleanup_System SHALL create separate commits for file renames
5. THE Repository_Cleanup_System SHALL create separate commits for path reference updates
6. WHEN creating commits, THE Repository_Cleanup_System SHALL use descriptive commit messages
7. FOR ALL commits, the message SHALL follow pattern: "chore(cleanup): [category] - [description]"

### Requirement 10: Measure Cleanup Success

**User Story:** As a developer, I want cleanup success measured quantitatively, so that I can verify the repository is more organized and navigable.

#### Acceptance Criteria

1. THE Repository_Cleanup_System SHALL count root-level files before cleanup
2. THE Repository_Cleanup_System SHALL count root-level files after cleanup
3. THE Repository_Cleanup_System SHALL calculate percentage reduction in root-level files
4. THE Repository_Cleanup_System SHALL report number of files moved to each category
5. THE Repository_Cleanup_System SHALL measure time to find a random documentation file before and after
6. IF time to find documentation is reduced by 80% or more, THEN cleanup SHALL be considered successful
7. THE Repository_Cleanup_System SHALL generate a cleanup summary report with all metrics
