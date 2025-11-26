#!/bin/bash

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 30

# Check if database already exists
DB_EXISTS=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -Q "SELECT name FROM sys.databases WHERE name = 'TaskFlowDB_Dev'" -h -1 | tr -d '[:space:]')

if [ "$DB_EXISTS" == "TaskFlowDB_Dev" ]; then
    echo "Database TaskFlowDB_Dev already exists. Skipping initialization."
    exit 0
fi

echo "Creating database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -Q "CREATE DATABASE TaskFlowDB_Dev;"

echo "Running full schema and data script..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/00_Full_Schema_And_Data.sql

echo "Running stored procedures - Login..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/12_StoredProcedures_Login.sql

echo "Updating password hash..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/13_UpdatePasswordHash.sql

echo "Seeding sample data..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/11_SeedData_Fixed.sql

echo "Database initialization completed!"