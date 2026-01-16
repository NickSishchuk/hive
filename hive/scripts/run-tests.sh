#!/bin/bash
set -e

TEST_TYPE="${1:-all}"

echo "=========================================="
echo "  Hive Test Runner"
echo "  Test type: $TEST_TYPE"
echo "=========================================="

run_unit() {
    echo "Running UNIT tests..."
    mvn test -Dgroups="unit" -DexcludedGroups="integration,e2e" --batch-mode
}

run_integration() {
    echo "Running INTEGRATION tests..."
    mvn test -Dgroups="integration" --batch-mode
}

run_e2e() {
    echo "Running E2E tests..."
    mvn test -Dgroups="e2e" --batch-mode
}

run_all() {
    echo "Running ALL tests..."
    mvn test --batch-mode
}

# Parse comma-separated test types
IFS=',' read -ra TYPES <<< "$TEST_TYPE"

for type in "${TYPES[@]}"; do
    case "$type" in
        unit)
            run_unit
            ;;
        integration)
            run_integration
            ;;
        e2e)
            run_e2e
            ;;
        all)
            run_all
            ;;
        *)
            echo "Unknown test type: $type"
            echo "Usage: $0 [unit|integration|e2e|all]"
            echo "       $0 unit,integration  (combine multiple)"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "  Tests completed!"
echo "=========================================="
