# Implementation Plan: Repository Cleanup and Organization

## Overview

This implementation plan breaks down the repository cleanup system into discrete coding tasks. The system consists of 8 Node.js components that execute sequentially to organize documentation and scripts, standardize file naming, update path references, and validate build integrity. Each task builds incrementally with atomic git commits for easy rollback.

## Tasks

- [x] 1. Set up project structure and configuration
  - Create scripts/cleanup/ directory for cleanup components
  - Create scripts/cleanup/config.json with categorization rules, protected files/directories, and date formats
  - Create test directory structure for unit and property-based tests
  - Install fast-check library for property-based testing: `npm install --save-dev fast-check`
  - _Requirements: 1.1-1.8, 2.7, 5.1-5.13_

- [ ] 2. Implement folder structure creator
  - [x] 2.1 Create scripts/cleanup/create-folders.js
    - Implement createFolderStructure() function to create docs/ and scripts/ subdirectories
    - Implement getFolderStructure() function returning target folder structure
    - Add validation to verify all folders created successfully
    - Add error handling for permission and disk space issues
    - _Requirements: 1.1-1.8_

  - [x] 2.2 Write unit tests for folder structure creator
    - Test all required documentation folders are created (summaries, audits, architecture, decisions, archive)
    - Test all required script folders are created (fixes, migrations, utilities)
    - Test error handling for permission failures
    - _Requirements: 1.1-1.8_

- [ ] 3. Implement file categorizer
  - [x] 3.1 Create scripts/cleanup/categorize-files.js
    - Implement categorizeFiles() function to scan root directory and classify files
    - Implement classifyDocumentation() function with pattern matching rules
    - Implement classifyScript() function with pattern matching rules
    - Implement isProtectedFile() function to identify governance files
    - Implement isOlderThan90Days() function using file modification timestamps
    - Generate categorization manifest as JSON file
    - _Requirements: 2.2-2.7, 4.1-4.6_

  - [x] 3.2 Write property test for file categorization by pattern matching
    - **Property 2: File categorization by pattern matching**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5**
    - Test files matching deployment summary patterns categorized to docs/summaries
    - Test files matching validation report patterns categorized to docs/audits
    - Test files matching infrastructure guide patterns categorized to docs/architecture
    - Test files matching quick reference patterns categorized to docs/decisions
    - Test files matching bug fix patterns categorized to scripts/fixes
    - Test files matching deployment script patterns categorized to scripts/migrations
    - Test files matching utility script patterns categorized to scripts/utilities
    - Use fast-check with 100+ iterations

  - [x] 3.3 Write property test for archive categorization by file age
    - **Property 3: Archive categorization by file age**
    - **Validates: Requirements 2.6**
    - Test files older than 90 days categorized to docs/archive regardless of pattern
    - Use fast-check to generate random file ages
    - Use fast-check with 100+ iterations

  - [x] 3.4 Write property test for protected file preservation
    - **Property 4: Protected file preservation**
    - **Validates: Requirements 2.7, 5.11, 5.12, 5.13**
    - Test protected files (aws-security-standards.md, deployment-standards.md, project-deployment-config.md) never moved
    - Use fast-check with 100+ iterations

  - [x] 3.5 Write unit tests for file categorizer
    - Test specific categorization examples for each pattern type
    - Test edge cases (files with multiple matching patterns, files with no matching patterns)
    - Test protected file detection
    - _Requirements: 2.2-2.7, 4.1-4.6_

- [ ] 4. Implement git move executor
  - [x] 4.1 Create scripts/cleanup/git-move-files.js
    - Implement moveFiles() function to execute git mv commands from manifest
    - Implement gitMove() function wrapping git mv command execution
    - Implement validateMove() function to verify file moved successfully
    - Add error handling for locked files and missing sources
    - Generate move operation report with success/failure details
    - _Requirements: 2.1_

  - [x] 4.2 Write property test for git history preservation
    - **Property 1: Git history preservation for file moves**
    - **Validates: Requirements 2.1**
    - Test git mv command used for all file moves
    - Test file history preserved and verifiable through git log --follow
    - Use fast-check with 100+ iterations

  - [x] 4.3 Write unit tests for git move executor
    - Test successful move operations
    - Test error handling for locked files
    - Test error handling for missing source files
    - Test move validation
    - _Requirements: 2.1_

- [x] 5. Checkpoint - Ensure categorization and move logic works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement file renamer
  - [x] 6.1 Create scripts/cleanup/rename-files.js
    - Implement renameFiles() function to rename files with date prefixes
    - Implement extractDate() function supporting multiple date formats (FEB-22-2026, 2025-10-15, 20251014, timestamps)
    - Implement formatDate() function returning YYYY-MM-DD format
    - Implement generateNewFilename() function following YYYY-MM-DD-purpose-topic.ext pattern
    - Implement getFileModificationDate() function as fallback when no date in filename
    - Execute git mv for renames to preserve history
    - _Requirements: 3.1-3.6_

  - [x] 6.2 Write property test for date extraction from filenames
    - **Property 6: Date extraction from filenames**
    - **Validates: Requirements 3.1**
    - Test dates in recognized formats extracted correctly
    - Use fast-check to generate random dates in various formats
    - Use fast-check with 100+ iterations

  - [x] 6.3 Write property test for date formatting standardization
    - **Property 7: Date formatting standardization**
    - **Validates: Requirements 3.2**
    - Test all extracted dates formatted as YYYY-MM-DD
    - Use fast-check to generate random dates
    - Use fast-check with 100+ iterations

  - [x] 6.4 Write property test for filename renaming pattern compliance
    - **Property 8: Filename renaming pattern compliance**
    - **Validates: Requirements 3.3, 3.4, 3.6**
    - Test renamed files follow YYYY-MM-DD-purpose-topic.ext pattern
    - Test date extracted from filename or derived from modification timestamp
    - Use fast-check with 100+ iterations

  - [x] 6.5 Write property test for file extension preservation
    - **Property 9: File extension preservation during rename**
    - **Validates: Requirements 3.5**
    - Test file extensions preserved exactly during renaming
    - Use fast-check to generate random filenames with various extensions
    - Use fast-check with 100+ iterations

  - [x] 6.6 Write unit tests for file renamer
    - Test date extraction for specific formats
    - Test fallback to file modification timestamp
    - Test filename generation with various inputs
    - Test edge cases (files with multiple dates, files with no dates)
    - _Requirements: 3.1-3.6_

- [ ] 7. Implement path reference updater
  - [x] 7.1 Create scripts/cleanup/update-references.js
    - Implement updateAllReferences() function coordinating all reference updates
    - Implement updatePackageJson() function to update "scripts" section paths
    - Implement updateGitHubWorkflows() function to update .github/workflows/*.yml paths
    - Implement updateScriptReferences() function to update require() and import statements
    - Implement findReferences() function to locate path references in file content
    - Generate update report with number of references updated per file
    - _Requirements: 4.7, 8.1-8.5_

  - [x] 7.2 Write property test for path reference updates in package.json
    - **Property 11: Path reference updates in package.json**
    - **Validates: Requirements 4.7, 8.5**
    - Test script path references updated to new locations
    - Use fast-check to generate random script paths
    - Use fast-check with 100+ iterations

  - [x] 7.3 Write property test for path reference detection in deployment scripts
    - **Property 12: Path reference detection in deployment scripts**
    - **Validates: Requirements 8.1, 8.2**
    - Test hardcoded file paths detected and updated
    - Use fast-check to generate random file paths
    - Use fast-check with 100+ iterations

  - [x] 7.4 Write property test for scripts/lib directory preservation
    - **Property 10: Scripts/lib directory preservation**
    - **Validates: Requirements 4.6**
    - Test files in scripts/lib never moved or categorized
    - Use fast-check with 100+ iterations

  - [x] 7.5 Write unit tests for path reference updater
    - Test package.json script path updates
    - Test GitHub Actions workflow path updates
    - Test script reference updates (require/import statements)
    - Test critical path validation (scripts/deploy.js, workflows)
    - _Requirements: 4.7, 8.1-8.5_

- [x] 8. Implement build validator
  - [x] 8.1 Create scripts/cleanup/validate-build.js
    - Implement validateBuild() function coordinating build validation
    - Implement runBuild() function executing npm run build
    - Implement validateOutputDirectory() function checking out/ directory
    - Implement analyzeBreakage() function identifying suspected broken files
    - Generate build validation report with success/failure and recommendations
    - _Requirements: 7.1-7.5_

  - [x] 8.2 Write unit tests for build validator
    - Test build validation succeeds when build passes
    - Test build validation reports suspected breakage on failure
    - Test output directory validation
    - Test breakage analysis
    - _Requirements: 7.1-7.5_

- [x] 9. Checkpoint - Ensure renaming, reference updates, and validation work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement navigation index creator
  - [x] 10.1 Create scripts/cleanup/create-navigation-index.js
    - Implement createNavigationIndex() function generating docs/README.md
    - Implement generateIndexContent() function creating markdown content
    - Include sections: Quick Links, Documentation Categories, Date Convention, Common Tasks
    - Link to protected files at root level
    - Provide examples of file types in each category
    - _Requirements: 6.1-6.6_

  - [x] 10.2 Write unit tests for navigation index creator
    - Test navigation index contains all required sections
    - Test navigation index links to protected files
    - Test navigation index describes each category
    - Test navigation index explains date convention
    - _Requirements: 6.1-6.6_

- [x] 11. Implement metrics reporter
  - [x] 11.1 Create scripts/cleanup/generate-metrics.js
    - Implement generateMetrics() function calculating cleanup success metrics
    - Implement countRootFiles() function counting files before/after
    - Implement measureSearchTime() function simulating documentation search
    - Implement calculateReduction() function computing percentage reduction
    - Implement determineSuccess() function checking 80% search time improvement threshold
    - Generate cleanup summary report with all metrics
    - _Requirements: 10.1-10.7_

  - [x] 11.2 Write unit tests for metrics reporter
    - Test metrics report contains all required fields
    - Test success determination based on 80% search time improvement
    - Test root file count calculation
    - Test reduction percentage calculation
    - _Requirements: 10.1-10.7_

- [x] 12. Implement cleanup orchestrator
  - [x] 12.1 Create scripts/cleanup-orchestrator.js
    - Implement runCleanup() function coordinating all phases
    - Implement runPhase() function executing individual phases with error handling
    - Implement createGitCommit() function creating atomic commits after each phase
    - Implement validatePreconditions() function checking git repository state and Node.js version
    - Implement dry-run mode for testing without making changes
    - Implement rollback support using git reset
    - Execute phases in order: folder creation, categorization, doc moves, script moves, renames, path updates, navigation index, build validation, metrics
    - Create separate git commits for each phase with descriptive messages
    - _Requirements: 9.1-9.7_

  - [x] 12.2 Write property test for protected directory preservation
    - **Property 5: Protected directory preservation**
    - **Validates: Requirements 5.1-5.10**
    - Test files in protected directories (node_modules, out, build-*, src, config, public, etc.) never modified
    - Use fast-check with 100+ iterations

  - [x] 12.3 Write property test for commit message pattern compliance
    - **Property 13: Commit message pattern compliance**
    - **Validates: Requirements 9.6, 9.7**
    - Test git commit messages follow "chore(cleanup): [category] - [description]" pattern
    - Use fast-check with 100+ iterations

  - [x] 12.4 Write unit tests for cleanup orchestrator
    - Test phase execution order
    - Test precondition validation (git repository clean, Node.js version)
    - Test error handling and rollback
    - Test dry-run mode
    - Test git commit creation for each phase
    - Test commit message format
    - _Requirements: 9.1-9.7_

- [x] 13. Implement end-to-end integration test
  - [x] 13.1 Write integration test for complete cleanup workflow
    - Setup test repository state with sample files
    - Execute full cleanup workflow
    - Verify all phases completed successfully
    - Verify folder structure created
    - Verify files moved to correct locations
    - Verify files renamed with date prefixes
    - Verify path references updated
    - Verify navigation index created
    - Verify build still works
    - Verify metrics show 80%+ reduction
    - _Requirements: All requirements 1.1-10.7_

- [x] 14. Final checkpoint - Ensure complete system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check (100+ iterations)
- Unit tests validate specific examples and edge cases
- Integration test validates end-to-end workflow
- All file moves use git mv to preserve history
- Each cleanup phase creates atomic git commit for easy rollback
- Protected files (aws-security-standards.md, deployment-standards.md, project-deployment-config.md) remain at root
- Protected directories (src/, config/, public/, node_modules/, out/, build-*) never modified
- Date format standardized to YYYY-MM-DD
- Success measured by 80%+ reduction in root files and 80%+ search time improvement
