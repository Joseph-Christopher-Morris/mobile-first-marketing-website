#!/usr/bin/env node

/**
 * Folder Structure Creator
 * Creates organized folder structure for documentation and scripts
 * 
 * Requirements: 1.1-1.8
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Returns the target folder structure
 * @returns {{ docs: string[], scripts: string[] }}
 */
function getFolderStructure() {
  return {
    docs: ['summaries', 'audits', 'architecture', 'decisions', 'archive'],
    scripts: ['fixes', 'migrations', 'utilities']
  };
}

/**
 * Creates organized folder structure for documentation and scripts
 * @returns {Promise<{ success: boolean, foldersCreated: string[], errors: string[] }>}
 */
async function createFolderStructure() {
  const result = {
    success: true,
    foldersCreated: [],
    errors: []
  };

  const structure = getFolderStructure();
  const baseDirs = ['docs', 'scripts'];

  try {
    // Create base directories first
    for (const baseDir of baseDirs) {
      try {
        await fs.mkdir(baseDir, { recursive: true });
        result.foldersCreated.push(baseDir);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          result.errors.push(`Failed to create ${baseDir}: ${error.message}`);
          result.success = false;
        }
      }
    }

    // Create docs subdirectories
    for (const subdir of structure.docs) {
      const dirPath = path.join('docs', subdir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        result.foldersCreated.push(dirPath);
      } catch (error) {
        if (error.code === 'EACCES') {
          result.errors.push(`Permission denied creating ${dirPath}`);
          result.success = false;
        } else if (error.code === 'ENOSPC') {
          result.errors.push(`No disk space available for ${dirPath}`);
          result.success = false;
        } else if (error.code !== 'EEXIST') {
          result.errors.push(`Failed to create ${dirPath}: ${error.message}`);
          result.success = false;
        }
      }
    }

    // Create scripts subdirectories
    for (const subdir of structure.scripts) {
      const dirPath = path.join('scripts', subdir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        result.foldersCreated.push(dirPath);
      } catch (error) {
        if (error.code === 'EACCES') {
          result.errors.push(`Permission denied creating ${dirPath}`);
          result.success = false;
        } else if (error.code === 'ENOSPC') {
          result.errors.push(`No disk space available for ${dirPath}`);
          result.success = false;
        } else if (error.code !== 'EEXIST') {
          result.errors.push(`Failed to create ${dirPath}: ${error.message}`);
          result.success = false;
        }
      }
    }

    // Validate all folders were created successfully
    const allFolders = [
      ...structure.docs.map(d => path.join('docs', d)),
      ...structure.scripts.map(s => path.join('scripts', s))
    ];

    for (const folder of allFolders) {
      try {
        const stats = await fs.stat(folder);
        if (!stats.isDirectory()) {
          result.errors.push(`${folder} exists but is not a directory`);
          result.success = false;
        }
      } catch (error) {
        result.errors.push(`Validation failed for ${folder}: ${error.message}`);
        result.success = false;
      }
    }

  } catch (error) {
    result.errors.push(`Unexpected error: ${error.message}`);
    result.success = false;
  }

  return result;
}

// Export functions
module.exports = {
  createFolderStructure,
  getFolderStructure
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('Creating folder structure...\n');
    
    const result = await createFolderStructure();
    
    if (result.success) {
      console.log('✓ Folder structure created successfully\n');
      console.log('Folders created:');
      result.foldersCreated.forEach(folder => {
        console.log(`  - ${folder}`);
      });
    } else {
      console.error('✗ Folder structure creation failed\n');
      console.error('Errors:');
      result.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
      process.exit(1);
    }
  })();
}
