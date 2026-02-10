#!/bin/bash
#
# Pre-commit check runner for Family Basic IDE
#
# This script runs comprehensive pre-commit checks including:
# - TypeScript type checking
# - ESLint with auto-fix
# - Stylelint checking
#
# Usage:
#   ./scripts/run-checks.sh [--no-fix] [--changed-only]
#
# Options:
#   --no-fix      Run checks without auto-fix (fails on any issues)
#   --changed-only Only check files that have changed (requires git)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
NO_FIX=false
CHANGED_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-fix)
      NO_FIX=true
      shift
      ;;
    --changed-only)
      CHANGED_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "======================================"
echo "  Family Basic IDE Pre-commit Checks"
echo "======================================"
echo ""

# Function to run a check and print results
run_check() {
  local name="$1"
  local command="$2"

  echo -e "${YELLOW}Running:${NC} $name"
  echo "Command: $command"

  if eval "$command"; then
    echo -e "${GREEN}✓ $name passed${NC}"
  else
    echo -e "${RED}✗ $name failed${NC}"
    return 1
  fi
  echo ""
}

# Get changed files if requested
if [ "$CHANGED_ONLY" = true ]; then
  # Try to get changed files against main/master branch
  if git rev-parse --verify main >/dev/null 2>&1; then
    BASE_BRANCH="main"
  elif git rev-parse --verify master >/dev/null 2>&1; then
    BASE_BRANCH="master"
  else
    echo -e "${YELLOW}Warning: No main/master branch found, checking all files${NC}"
    CHANGED_ONLY=false
  fi

  if [ "$CHANGED_ONLY" = true ]; then
    CHANGED_TS=$(git diff --name-only --diff-filter=d "$BASE_BRANCH"...HEAD | grep '\.ts$' | head -20)
    CHANGED_VUE=$(git diff --name-only --diff-filter=d "$BASE_BRANCH"...HEAD | grep '\.vue$' | head -20)
    CHANGED_CSS=$(git diff --name-only --diff-filter=d "$BASE_BRANCH"...HEAD | grep -E '\.(css|scss)$' | head -20)
  fi
fi

# TypeScript type checking
echo "======================================"
echo "  TypeScript Type Checking"
echo "======================================"
if run_check "TypeScript" "pnpm type-check"; then
  TS_PASSED=true
else
  TS_PASSED=false
fi

# ESLint
echo "======================================"
echo "  ESLint"
echo "======================================"
if [ "$NO_FIX" = true ]; then
  if run_check "ESLint (check only)" "pnpm eslint . --ext .ts,.vue --max-warnings 0"; then
    ESLINT_PASSED=true
  else
    ESLINT_PASSED=false
  fi
else
  echo -e "${YELLOW}Running:${NC} ESLint with auto-fix"
  echo "Command: pnpm lint"
  if pnpm lint; then
    echo -e "${GREEN}✓ ESLint passed (auto-fix applied)${NC}"
    ESLINT_PASSED=true
  else
    echo -e "${RED}✗ ESLint failed (check remaining issues above)${NC}"
    ESLINT_PASSED=false
  fi
  echo ""
fi

# Stylelint
echo "======================================"
echo "  Stylelint"
echo "======================================"
if run_check "Stylelint" "pnpm lint:style"; then
  STYLELINT_PASSED=true
else
  STYLELINT_PASSED=false
fi

# Summary
echo "======================================"
echo "  Summary"
echo "======================================"

ALL_PASSED=true

if [ "$TS_PASSED" = true ]; then
  echo -e "  TypeScript: ${GREEN}✓ PASSED${NC}"
else
  echo -e "  TypeScript: ${RED}✗ FAILED${NC}"
  ALL_PASSED=false
fi

if [ "$ESLINT_PASSED" = true ]; then
  echo -e "  ESLint:      ${GREEN}✓ PASSED${NC}"
else
  echo -e "  ESLint:      ${RED}✗ FAILED${NC}"
  ALL_PASSED=false
fi

if [ "$STYLELINT_PASSED" = true ]; then
  echo -e "  Stylelint:  ${GREEN}✓ PASSED${NC}"
else
  echo -e "  Stylelint:  ${RED}✗ FAILED${NC}"
  ALL_PASSED=false
fi

echo ""

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}All checks passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some checks failed. Please fix the issues above.${NC}"
  exit 1
fi
