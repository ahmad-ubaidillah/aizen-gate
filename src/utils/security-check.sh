#!/bin/bash

# Simple secret scanner for Aizen-Gate
# Checks for common accidental leaks in the codebase.

echo "--- ⛩️ [AZ] Security Audit (Secret Scanning) ---"

# List of patterns to search for
PATTERNS=(
    "AIZEN_GATE_KEY"
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY"
    "GEMINI_API_KEY"
    "AWS_SECRET_ACCESS_KEY"
    "DATABASE_URL"
    "sk-[a-zA-Z0-9]{48}" # Generic OpenAI-like keys
)

EXIT_CODE=0

for PATTERN in "${PATTERNS[@]}"; do
    # Search staged files or current directory
    # Exclude the pattern definition itself to avoid self-flagging
    MATCHES=$(grep -rE "$PATTERN" --exclude-dir=".git" --exclude-dir="node_modules" --exclude-dir="aizen-gate" --exclude="*.log" --exclude="*.db" --exclude="*.md" --exclude="*.csv" --exclude="security-check.sh" .)
    
    if [ ! -z "$MATCHES" ]; then
        echo "❌ [SECURITY ALERT] Potential secret leak found with pattern: $PATTERN"
        echo "$MATCHES"
        EXIT_CODE=1
    fi
done

if [ $EXIT_CODE -eq 0 ]; then
    echo "✔ Security audit passed. No plain-text secrets detected."
fi

exit $EXIT_CODE
