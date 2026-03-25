#!/bin/bash
# Organize untracked root files into local-artefacts structure
# Non-destructive: preserves all files, no overwrites

MOVED=0
SKIPPED=0

# Function to move file safely
move_file() {
    local src="$1"
    local dest="$2"
    
    if [ ! -f "$src" ]; then
        return
    fi
    
    if [ -f "$dest" ]; then
        echo "SKIP: $src (destination exists)"
        ((SKIPPED++))
        return
    fi
    
    mv "$src" "$dest"
    echo "MOVED: $src -> $dest"
    ((MOVED++))
}

echo "=== Phase 1: JSON Files ==="

# Validation reports
for file in *validation-report*.json *validation-summary*.json; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/reports/validation/$file"
done

# Monitoring reports
for file in monitoring-report*.json health-check-report*.json; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/reports/monitoring/$file"
done

# Rollback reports
for file in rollback-test-report*.json; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/reports/rollback/$file"
done

# Performance reports
for file in performance-*.json lighthouse-*.json; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/reports/performance/$file"
done

# Deployment reports
for file in deployment-report*.json deployment-health*.json scram-deployment-report*.json; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/reports/misc/$file"
done

# Misc JSON
for file in *.json; do
    [ -f "$file" ] && [[ ! "$file" =~ ^(package|tsconfig) ]] && move_file "$file" "local-artefacts/json-misc/$file"
done

echo ""
echo "=== Phase 2: Markdown Files ==="

# Auto-generated summaries
for file in *-summary*.md *-report*.md *validation*.md; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/documentation/auto-generated/$file"
done

# Legacy notes (manually written)
for file in *FINAL*.md *IMPLEMENTATION*.md *FIX*.md *NOTES*.md *GUIDE*.md DEPLOYMENT-*.md; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/documentation/legacy-notes/$file"
done

# Remaining markdown (except protected)
for file in *.md; do
    if [[ ! "$file" =~ ^(README|aws-security-standards|deployment-standards|project-deployment-config) ]]; then
        [ -f "$file" ] && move_file "$file" "local-artefacts/documentation/legacy-notes/$file"
    fi
done

echo ""
echo "=== Phase 3: PowerShell Scripts ==="

# Deploy scripts
for file in deploy-*.ps1; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/deploy-legacy/$file"
done

# Rollback scripts
for file in rollback-*.ps1 revert-*.ps1 selective-rollback*.ps1; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/rollback-legacy/$file"
done

# Optimization scripts
for file in *optimization*.ps1 *optimisation*.ps1 run-optimization*.ps1 configure-*.ps1; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/optimisation-legacy/$file"
done

# Misc PowerShell
for file in *.ps1; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/misc/$file"
done

echo ""
echo "=== Phase 4: Batch Files ==="

# Deploy batch
for file in deploy-*.bat; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/deploy-legacy/$file"
done

# Rollback batch
for file in rollback-*.bat revert-*.bat; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/rollback-legacy/$file"
done

# Misc batch
for file in *.bat; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/scripts/misc/$file"
done

echo ""
echo "=== Phase 5: HTML Files ==="

for file in *.html; do
    [ -f "$file" ] && move_file "$file" "local-artefacts/html-tests/$file"
done

echo ""
echo "=== Summary ==="
echo "Files moved: $MOVED"
echo "Files skipped: $SKIPPED"
echo ""
echo "Root directory cleaned. All files preserved in local-artefacts/"
