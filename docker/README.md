# Docker Setup for TaskFlow

This folder contains all Docker-related files and persistent storage for the TaskFlow application.

## Structure

```
docker/
├── docker-compose.yml     # Docker Compose configuration for SQL Server
├── sqlserver/             # SQL Server persistent storage
│   ├── data/              # Database files (.mdf, .ldf) - mapped to container
│   ├── log/               # SQL Server logs
│   └── backup/            # Database backups
└── README.md              # This file
```

## SQL Server Configuration

### Database Files
All SQL Server database files are stored in `./sqlserver/data/`:
- `TaskFlowDB_Dev.mdf` - Main database file
- `TaskFlowDB_Dev_log.ldf` - Transaction log file
- System databases (master, msdb, model, tempdb)

**Important:** These files are persistent and survive container restarts/removals.

### First Time Setup

1. Navigate to docker folder and start SQL Server container:
```bash
cd docker
docker-compose up -d
```

2. Wait for SQL Server to be ready (~30 seconds)

3. Go back to root folder and initialize database with sample data:
```bash
cd ..
```
```powershell
.\init-database-simple.ps1
```

This creates:
- Database schema (tables, indexes, constraints)
- Stored procedures for login
- Sample data for 2 sites (ACME, TECHSTART)
- User accounts with password: `admin123`

### Daily Usage

Just start/stop the container - database is already initialized:

```bash
# Navigate to docker folder
cd docker

# Start SQL Server
docker-compose up -d

# Stop SQL Server
docker-compose down

# Restart SQL Server
docker-compose restart

# View logs
docker logs taskflow-sqlserver
```

### Connection Details

- **Host:** localhost
- **Port:** 1433
- **User:** sa
- **Password:** TaskFlow@2025!Strong
- **Database:** TaskFlowDB_Dev

### Sample Login Credentials

**Site: ACME**
- Admin: admin@acme.com / admin123
- Manager: manager@acme.com / admin123

**Site: TECHSTART**
- Admin: ceo@techstart.com / admin123
- Manager: dev@techstart.com / admin123

## Reset Database

If you need to reset/recreate the database:

```bash
# Stop and remove container
cd docker
docker-compose down

# Delete database files
rm -rf sqlserver/data/*
rm -rf sqlserver/log/*

# Restart and re-initialize
docker-compose up -d
# Wait 30 seconds, then run from root folder:
cd ..
.\init-database-simple.ps1
```

## Notes

- Database files are **NOT** committed to git (see `.gitignore`)
- Each developer initializes their own local database
- Frontend and Backend run locally (not in Docker)
- Only SQL Server runs in Docker for consistency