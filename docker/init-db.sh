#!/bin/bash
# Init script for SQL Server - runs only on first startup

# Wait for SQL Server to start
echo "Waiting for SQL Server to be ready..."
sleep 15

# Check if database already exists
DB_EXISTS=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -Q "SELECT name FROM sys.databases WHERE name='TaskFlowDB_Dev'" -h -1 | grep -c "TaskFlowDB_Dev")

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Database does not exist. Running initialization scripts..."

    # Create database
    echo "Creating database TaskFlowDB_Dev..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -Q "CREATE DATABASE TaskFlowDB_Dev;"

    # Run full schema and data script
    echo "Running schema and seed data..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/00_Full_Schema_And_Data.sql

    # Run additional scripts if needed
    if [ -f /docker-entrypoint-initdb.d/13_UpdatePasswordHash.sql ]; then
        echo "Updating password hashes..."
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/13_UpdatePasswordHash.sql
    fi

    if [ -f /docker-entrypoint-initdb.d/14_AddTaskOrderColumn.sql ]; then
        echo "Adding task order column..."
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -d TaskFlowDB_Dev -i /docker-entrypoint-initdb.d/14_AddTaskOrderColumn.sql
    fi

    echo "✅ Database initialization completed!"
else
    echo "✅ Database already exists. Skipping initialization."
fi
