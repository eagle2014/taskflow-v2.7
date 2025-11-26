#!/bin/bash
# Start all 3 services independently

echo "🚀 Starting TaskFlow services independently..."

# Start SQL Server first
echo ""
echo "1️⃣ Starting SQL Server..."
cd "$(dirname "$0")"
docker-compose -f sql.yml up -d

# Wait for SQL Server to be healthy
echo "⏳ Waiting for SQL Server to be ready..."
sleep 5
until docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -Q "SELECT 1" &>/dev/null; do
    echo "   Still waiting..."
    sleep 3
done
echo "✅ SQL Server is ready!"

# Start Backend
echo ""
echo "2️⃣ Starting Backend API..."
docker-compose -f backend.yml up -d

# Wait a bit
echo "⏳ Waiting for Backend to start..."
sleep 5
echo "✅ Backend started!"

# Start Frontend
echo ""
echo "3️⃣ Starting Frontend..."
docker-compose -f frontend.yml up -d

echo "⏳ Waiting for Frontend to start..."
sleep 3
echo "✅ Frontend started!"

echo ""
echo "🎉 All services started!"
echo ""
echo "📊 Service URLs:"
echo "   - SQL Server:  localhost:1433"
echo "   - Backend API: http://localhost:5001"
echo "   - Frontend:    http://localhost:3000"
echo ""
echo "📝 View logs:"
echo "   docker logs -f taskflow-sqlserver"
echo "   docker logs -f taskflow-backend"
echo "   docker logs -f taskflow-frontend"
echo ""
echo "🛑 Stop services:"
echo "   cd docker && ./stop-all.sh"
