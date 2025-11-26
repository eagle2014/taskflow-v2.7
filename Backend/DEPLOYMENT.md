# TaskFlow Backend - Deployment Guide

Complete guide for deploying TaskFlow API to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Application Configuration](#application-configuration)
4. [Deployment Methods](#deployment-methods)
   - [Azure App Service](#azure-app-service)
   - [Docker Container](#docker-container)
   - [IIS (On-Premises)](#iis-on-premises)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Security

- [ ] **Change JWT SecretKey** - Generate new random 32+ character key
- [ ] **Update CORS Origins** - Set production domain URLs
- [ ] **Enable HTTPS Only** - Set `RequireHttpsMetadata = true`
- [ ] **Disable Swagger** - Set `EnableSwagger = false` in production
- [ ] **Review Connection Strings** - Use secure connection with encrypted credentials
- [ ] **Enable SQL Server Encryption** - TLS/SSL for database connections
- [ ] **Secrets Management** - Use Azure Key Vault or environment variables
- [ ] **Rate Limiting** - Implement API rate limiting
- [ ] **Input Validation** - Verify all DTOs have proper validation

### Performance

- [ ] **Database Indexes** - Verify all indexes are created
- [ ] **Connection Pooling** - Configure optimal pool size
- [ ] **Response Caching** - Enable where appropriate
- [ ] **Compression** - Enable response compression (already configured)
- [ ] **CDN Setup** - For static assets if any

### Reliability

- [ ] **Health Checks** - Verify `/health` endpoint works
- [ ] **Logging** - Configure structured logging (Serilog, Application Insights)
- [ ] **Error Handling** - Test global error handler
- [ ] **Database Backups** - Automated backup schedule
- [ ] **Disaster Recovery Plan** - Document recovery procedures

---

## Database Setup

### 1. Create Production Database

```sql
-- On Production SQL Server
CREATE DATABASE TaskFlowDB;
GO

USE TaskFlowDB;
GO
```

### 2. Run Database Scripts

Execute scripts in this exact order:

```sql
-- 1. Schema
-- Execute: Database/01_CreateSchema.sql

-- 2. Stored Procedures (in order)
-- Execute: Database/02_StoredProcedures_Users.sql
-- Execute: Database/03_StoredProcedures_Projects.sql
-- Execute: Database/04_StoredProcedures_Tasks.sql
-- Execute: Database/05_StoredProcedures_Events.sql
-- Execute: Database/06_StoredProcedures_Comments.sql
-- Execute: Database/07_StoredProcedures_Categories.sql
-- Execute: Database/08_StoredProcedures_Spaces.sql
-- Execute: Database/09_StoredProcedures_Phases.sql
```

### 3. Create Production Tenants

```sql
-- Create your production tenants
INSERT INTO Sites (SiteID, SiteName, SiteCode, Domain, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'Your Company Name', 'YOURCODE', 'yourdomain.com', 1, 1000, 500, GETUTCDATE(), GETUTCDATE());

-- Get the Site ID for reference
SELECT SiteID, SiteName, SiteCode FROM Sites;
```

### 4. Create Initial Admin User

You'll need to use the API register endpoint after deployment, or manually insert with BCrypt hash.

### 5. Configure Database Backup

```sql
-- Full backup daily
BACKUP DATABASE TaskFlowDB
TO DISK = 'D:\Backups\TaskFlowDB_Full.bak'
WITH INIT, FORMAT, COMPRESSION;

-- Transaction log backup hourly
BACKUP LOG TaskFlowDB
TO DISK = 'D:\Backups\TaskFlowDB_Log.trn'
WITH INIT, FORMAT, COMPRESSION;
```

Set up SQL Server Agent jobs for automated backups.

---

## Application Configuration

### 1. Update appsettings.json

Create `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_PROD_SERVER;Database=TaskFlowDB;User Id=TaskFlowAppUser;Password=STRONG_PASSWORD_HERE;TrustServerCertificate=False;Encrypt=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "SecretKey": "GENERATE_NEW_RANDOM_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG_FOR_PRODUCTION",
    "Issuer": "TaskFlowAPI_Production",
    "Audience": "TaskFlowClient_Production",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": "https://yourdomain.com,https://app.yourdomain.com"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Error"
    }
  },
  "AppSettings": {
    "MaxUploadSizeInMB": 10,
    "DefaultPageSize": 20,
    "MaxPageSize": 100,
    "EnableSwagger": false,
    "PasswordMinLength": 8,
    "PasswordRequireDigit": true,
    "PasswordRequireUppercase": true,
    "PasswordRequireSpecialChar": true
  }
}
```

### 2. Generate JWT Secret Key

PowerShell:
```powershell
# Generate random 64 character key
-join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Or online: https://randomkeygen.com/ (use "Fort Knox Passwords")

### 3. Environment Variables (Recommended for Secrets)

Instead of storing secrets in `appsettings.json`, use environment variables:

```bash
# Set environment variables
TASKFLOW_JWT_SECRET="your-secret-key-here"
TASKFLOW_DB_CONNECTION="your-connection-string-here"
```

Update Program.cs to read from environment:
```csharp
var jwtSecret = Environment.GetEnvironmentVariable("TASKFLOW_JWT_SECRET") ??
                builder.Configuration["Jwt:SecretKey"];
```

---

## Deployment Methods

### Azure App Service

#### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name TaskFlow-RG --location eastus

# Create App Service Plan (B1 or higher for production)
az appservice plan create --name TaskFlow-Plan --resource-group TaskFlow-RG --sku B1 --is-linux

# Create Web App
az webapp create --name taskflow-api --resource-group TaskFlow-RG --plan TaskFlow-Plan --runtime "DOTNETCORE:8.0"

# Create Azure SQL Database
az sql server create --name taskflow-sql --resource-group TaskFlow-RG --location eastus --admin-user sqladmin --admin-password "YourPassword123!"
az sql db create --name TaskFlowDB --server taskflow-sql --resource-group TaskFlow-RG --service-objective S0
```

#### 2. Configure App Service

```bash
# Set connection string
az webapp config connection-string set --name taskflow-api --resource-group TaskFlow-RG --connection-string-type SQLAzure --settings DefaultConnection="Server=tcp:taskflow-sql.database.windows.net,1433;Database=TaskFlowDB;User ID=sqladmin;Password=YourPassword123!;Encrypt=True;TrustServerCertificate=False;"

# Set application settings
az webapp config appsettings set --name taskflow-api --resource-group TaskFlow-RG --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    Jwt__SecretKey="YOUR_SECRET_KEY" \
    Cors__AllowedOrigins="https://yourdomain.com"

# Enable HTTPS only
az webapp update --name taskflow-api --resource-group TaskFlow-RG --https-only true

# Configure custom domain (optional)
az webapp config hostname add --webapp-name taskflow-api --resource-group TaskFlow-RG --hostname api.yourdomain.com
```

#### 3. Deploy via Visual Studio

1. Right-click project → **Publish**
2. Select **Azure** → **Azure App Service (Windows/Linux)**
3. Select your subscription and app service
4. Click **Publish**

#### 4. Deploy via Azure CLI

```bash
# Build and publish
dotnet publish -c Release -o ./publish

# Create zip
cd publish
zip -r ../publish.zip *
cd ..

# Deploy to Azure
az webapp deployment source config-zip --resource-group TaskFlow-RG --name taskflow-api --src publish.zip
```

---

### Docker Container

#### 1. Create Dockerfile

Already created at project root. Build and run:

```bash
# Build image
docker build -t taskflow-api:latest -f Backend/TaskFlow.API/Dockerfile .

# Run container
docker run -d \
  -p 8080:80 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="Server=host.docker.internal;Database=TaskFlowDB;User Id=sa;Password=YourPassword;" \
  -e Jwt__SecretKey="YOUR_SECRET_KEY" \
  --name taskflow-api \
  taskflow-api:latest

# Check logs
docker logs taskflow-api

# Access at http://localhost:8080
```

#### 2. Docker Compose (with SQL Server)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

  api:
    image: taskflow-api:latest
    build:
      context: .
      dockerfile: Backend/TaskFlow.API/Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=TaskFlowDB;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;
      - Jwt__SecretKey=YOUR_SECRET_KEY_HERE
    ports:
      - "8080:80"
    depends_on:
      - sqlserver

volumes:
  sqldata:
```

Run:
```bash
docker-compose up -d
```

#### 3. Push to Docker Hub

```bash
# Tag image
docker tag taskflow-api:latest yourusername/taskflow-api:latest

# Push to Docker Hub
docker push yourusername/taskflow-api:latest
```

---

### IIS (On-Premises)

#### 1. Prerequisites

- Windows Server 2019 or later
- IIS 10+ with ASP.NET Core Module
- .NET 8.0 Runtime (Hosting Bundle)
- SQL Server 2019+

#### 2. Install .NET Hosting Bundle

Download and install: https://dotnet.microsoft.com/download/dotnet/8.0

#### 3. Publish Application

```bash
dotnet publish -c Release -o C:\inetpub\taskflow-api
```

#### 4. Create IIS Application

1. Open **IIS Manager**
2. Right-click **Sites** → **Add Website**
3. Site name: `TaskFlow API`
4. Physical path: `C:\inetpub\taskflow-api`
5. Port: `80` (or `443` for HTTPS)
6. Create application pool: `.NET CLR Version: No Managed Code`

#### 5. Configure Application Pool

1. Select application pool
2. **Basic Settings** → `.NET CLR version: No Managed Code`
3. **Advanced Settings** → `Start Mode: AlwaysRunning`
4. Identity: `ApplicationPoolIdentity` or custom service account

#### 6. Configure web.config

Should be auto-generated, but verify:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\TaskFlow.API.dll"
                  stdoutLogEnabled="true"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

#### 7. Configure HTTPS

1. Obtain SSL certificate
2. In IIS, **Bindings** → **Add** → **HTTPS** → Select certificate
3. Update `appsettings.json` to require HTTPS

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Should return: "Healthy"
```

### 2. Test API Endpoints

```bash
# Register first user
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "System Administrator",
    "siteCode": "YOURCODE"
  }'

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "siteCode": "YOURCODE"
  }'
```

### 3. Update Frontend Configuration

Update React app to point to production API:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### 4. Configure CDN (Optional)

If using CDN for API:
- CloudFlare
- Azure CDN
- AWS CloudFront

---

## Monitoring

### Application Insights (Azure)

```bash
# Add Application Insights
az monitor app-insights component create --app taskflow-insights --location eastus --resource-group TaskFlow-RG

# Get instrumentation key
az monitor app-insights component show --app taskflow-insights --resource-group TaskFlow-RG --query instrumentationKey
```

Add to `appsettings.json`:
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "YOUR_KEY_HERE"
  }
}
```

### Structured Logging with Serilog

Install packages:
```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.ApplicationInsights
```

Configure in Program.cs:
```csharp
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/taskflow-.txt", rollingInterval: RollingInterval.Day)
        .WriteTo.ApplicationInsights(TelemetryConfiguration.Active, TelemetryConverter.Traces);
});
```

### Health Checks Dashboard

Access: `https://api.yourdomain.com/health`

Monitor:
- Database connectivity
- API response times
- Memory usage
- CPU usage

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to SQL Server

**Solutions:**
1. Verify connection string is correct
2. Check SQL Server firewall allows incoming connections
3. Verify SQL Server authentication mode (Windows vs SQL)
4. Test connection from app server using SSMS or sqlcmd
5. Check app service account has database permissions

```sql
-- Grant permissions to app user
USE TaskFlowDB;
GO

CREATE USER TaskFlowAppUser WITH PASSWORD = 'StrongPassword123!';
GO

ALTER ROLE db_datareader ADD MEMBER TaskFlowAppUser;
ALTER ROLE db_datawriter ADD MEMBER TaskFlowAppUser;
ALTER ROLE db_ddladmin ADD MEMBER TaskFlowAppUser;
GO
```

### JWT Token Issues

**Problem:** 401 Unauthorized errors

**Solutions:**
1. Verify JWT secret matches in all environments
2. Check token expiration times
3. Validate issuer and audience settings
4. Ensure clocks are synchronized (use NTP)

### CORS Errors

**Problem:** Frontend can't access API

**Solutions:**
1. Verify `AllowedOrigins` includes frontend domain
2. Check HTTPS vs HTTP protocol match
3. Ensure credentials are allowed if needed
4. Verify preflight OPTIONS requests succeed

### Performance Issues

**Problem:** Slow API responses

**Solutions:**
1. Check database query performance (use SQL Profiler)
2. Verify indexes exist on frequently queried columns
3. Enable response compression
4. Implement caching for read-heavy endpoints
5. Scale up app service plan
6. Add database read replicas

### Deployment Fails

**Problem:** Deployment errors

**Solutions:**
1. Check build logs for compilation errors
2. Verify all dependencies are published
3. Ensure target framework matches server
4. Check file permissions
5. Review IIS logs: `C:\inetpub\logs\LogFiles`

---

## Rollback Procedure

If deployment fails:

### Azure App Service
```bash
# List deployment slots
az webapp deployment slot list --name taskflow-api --resource-group TaskFlow-RG

# Swap back to previous slot
az webapp deployment slot swap --name taskflow-api --resource-group TaskFlow-RG --slot staging
```

### Docker
```bash
# Rollback to previous version
docker pull yourusername/taskflow-api:v1.0.0
docker stop taskflow-api
docker rm taskflow-api
docker run -d -p 8080:80 --name taskflow-api yourusername/taskflow-api:v1.0.0
```

### IIS
1. Stop application pool
2. Replace files with previous version backup
3. Start application pool

---

## Security Hardening

### 1. SQL Injection Prevention
✅ Already protected - using stored procedures with parameterized queries

### 2. XSS Prevention
- Implement Content Security Policy headers
- Sanitize all output

### 3. Rate Limiting

Install package:
```bash
dotnet add package AspNetCoreRateLimit
```

Configure in Program.cs - see documentation.

### 4. API Key for Sensitive Operations

For admin operations, require API key in addition to JWT.

### 5. Database Encryption

Enable Transparent Data Encryption (TDE):
```sql
USE master;
GO

CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'YourStrongPassword!';
GO

CREATE CERTIFICATE TaskFlowCert WITH SUBJECT = 'TaskFlow TDE Certificate';
GO

USE TaskFlowDB;
GO

CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE TaskFlowCert;
GO

ALTER DATABASE TaskFlowDB
SET ENCRYPTION ON;
GO
```

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact DevOps team
- Open support ticket

Good luck with your deployment! 🚀
