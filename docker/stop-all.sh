#!/bin/bash
# Stop all 3 services

echo "🛑 Stopping TaskFlow services..."

cd "$(dirname "$0")"

echo "Stopping Frontend..."
docker-compose -f frontend.yml down

echo "Stopping Backend..."
docker-compose -f backend.yml down

echo "Stopping SQL Server..."
docker-compose -f sql.yml down

echo "✅ All services stopped!"
echo ""
echo "📊 To remove all data:"
echo "   docker-compose -f sql.yml down -v"
echo "   rm -rf sqlserver/data sqlserver/log"
