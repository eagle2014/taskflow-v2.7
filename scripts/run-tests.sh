#!/bin/bash

# TaskFlow Automated Test Runner
# Runs full stack with Docker Compose and executes E2E tests

set -e

echo "=================================================="
echo "TaskFlow Automated Test Suite"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL=${API_BASE_URL:-"http://localhost:5001/api"}
SITE_CODE=${SITE_CODE:-"ACME"}
MAX_WAIT_TIME=180 # 3 minutes

echo "📋 Test Configuration:"
echo "   API URL: $API_BASE_URL"
echo "   Site Code: $SITE_CODE"
echo "   Max Wait Time: ${MAX_WAIT_TIME}s"
echo ""

# Step 1: Clean up existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Start services
echo "🚀 Starting Docker Compose services..."
docker-compose up -d

# Wait for SQL Server to be healthy
echo "⏳ Waiting for SQL Server to be ready..."
COUNTER=0
until docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong" -Q "SELECT 1" > /dev/null 2>&1; do
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -gt $MAX_WAIT_TIME ]; then
        echo -e "${RED}❌ SQL Server failed to start within ${MAX_WAIT_TIME} seconds${NC}"
        docker-compose logs sqlserver
        exit 1
    fi
    echo "   Waiting for SQL Server... (${COUNTER}s)"
    sleep 1
done
echo -e "${GREEN}✅ SQL Server is ready${NC}"
echo ""

# Step 3: Initialize database
echo "🗄️  Initializing database..."
docker-compose up db-init
DB_INIT_EXIT_CODE=$(docker inspect taskflow-db-init --format='{{.State.ExitCode}}')
if [ "$DB_INIT_EXIT_CODE" != "0" ]; then
    echo -e "${RED}❌ Database initialization failed${NC}"
    docker-compose logs db-init
    exit 1
fi
echo -e "${GREEN}✅ Database initialized successfully${NC}"
echo ""

# Step 4: Wait for backend to be healthy
echo "⏳ Waiting for Backend API to be ready..."
COUNTER=0
until curl -f http://localhost:5001/health > /dev/null 2>&1; do
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -gt $MAX_WAIT_TIME ]; then
        echo -e "${RED}❌ Backend failed to start within ${MAX_WAIT_TIME} seconds${NC}"
        docker-compose logs backend
        exit 1
    fi
    echo "   Waiting for Backend API... (${COUNTER}s)"
    sleep 1
done
echo -e "${GREEN}✅ Backend API is ready${NC}"
echo ""

# Step 5: Run E2E Tests
echo "🧪 Running End-to-End Tests..."
echo "=================================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile TypeScript test file
echo "🔨 Compiling test script..."
npx tsx tests/e2e-test.ts

TEST_EXIT_CODE=$?

echo ""
echo "=================================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
else
    echo -e "${RED}❌ TESTS FAILED${NC}"
fi

# Step 6: Show logs if tests failed
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "📝 Backend Logs (last 50 lines):"
    echo "=================================================="
    docker-compose logs --tail=50 backend
fi

# Step 7: Cleanup (optional - comment out to keep running)
# echo ""
# echo "🧹 Cleaning up..."
# docker-compose down -v

echo ""
echo "=================================================="
echo "Test run completed"
echo "=================================================="

exit $TEST_EXIT_CODE
