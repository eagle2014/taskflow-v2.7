# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role & Responsibilities

Analyze user requirements, delegate tasks to sub-agents, ensure delivery meets specifications and architectural standards.

## Development Commands

### Frontend (React/TypeScript/Vite)
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 3000, auto-switches if busy)
npm run build            # Production build
npm test                 # Run E2E tests
```

### Backend (.NET 8.0)
```bash
cd Backend/TaskFlow.API
dotnet restore           # Restore packages
dotnet run               # Start API (port 5001)
dotnet build             # Compile (run after code changes to verify)
dotnet watch run         # Hot reload mode
```

### Docker
```bash
npm run docker:up        # Start all services
npm run docker:down      # Stop services
npm run docker:reset     # Reset and restart
npm run docker:logs      # View logs
```

### Database
```bash
# Run SQL migration script (PowerShell)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./run-logto-migration.ps1"

# Direct SQL Server access in Docker
docker exec -it taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -d TaskFlowDB_Dev
```

## Architecture Overview

### Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: .NET 8.0 Web API + Dapper ORM + JWT Auth
- **Database**: SQL Server 2022
- **Auth**: Dual-mode (Legacy JWT + Logto OAuth/OIDC)

### Multi-Tenant Pattern
All entities contain `SiteID` column. Every query filters by user's `SiteID` from JWT claims. Controllers extend `ApiControllerBase` with `GetCurrentSiteID()` and `GetCurrentUserID()` helpers.

### Backend Structure (Backend/TaskFlow.API/)
```
Controllers/     → API endpoints (10 controllers: Auth, Logto, Projects, Tasks, Phases, Spaces, Categories, Comments, Events, Users)
Models/Entities/ → Domain models (Site, User, Project, Task, Phase, Space, Category, Comment, CalendarEvent)
Models/DTOs/     → Request/response objects organized by feature
Repositories/    → Dapper data access layer
Services/        → Business logic (AuthService, TokenManager)
Middleware/      → Error handling
```

### Frontend Structure (src/)
```
components/          → Feature components + workspace module
components/ui/       → shadcn/ui library (30+ components)
components/workspace/ → Workspace views with custom hooks (useWorkspaceState, useTaskManagement, etc.)
services/            → API client with auto token refresh
config/              → Logto configuration
types/               → TypeScript definitions
```

### API Patterns
- Base URL: `http://localhost:5001/api`
- All endpoints (except `/auth/*`) require JWT in Authorization header
- Response format: `{ success: bool, data: T, error: string?, message: string }`
- Standard REST: GET list, GET by ID, POST create, PUT update, DELETE soft-delete

### Key Technical Decisions
- **Dapper over EF**: Lightweight ORM for performance
- **GUID primary keys**: For distributed systems
- **LocalStorage tokens**: Access + refresh tokens (consider HttpOnly cookies for production)
- **Soft deletes**: `IsDeleted` flag instead of hard delete

## Workflows

**IMPORTANT:** Follow strictly `./.claude/workflows/development-rules.md`
**IMPORTANT:** Read `./README.md` before planning any implementation
**IMPORTANT:** Sacrifice grammar for concision in reports
**IMPORTANT:** List unresolved questions at end of reports

### Workflow Files
- Primary: `./.claude/workflows/primary-workflow.md`
- Rules: `./.claude/workflows/development-rules.md`
- Orchestration: `./.claude/workflows/orchestration-protocol.md`
- Docs: `./.claude/workflows/documentation-management.md`

### Development Principles
- **YAGNI** (You Aren't Gonna Need It)
- **KISS** (Keep It Simple, Stupid)
- **DRY** (Don't Repeat Yourself)
- Keep files under 200 lines
- Run `dotnet build` after backend changes to verify compilation
- Use `code-reviewer` agent after implementations

## Authentication

### Legacy Auth
Uses `SimpleAuthReal.tsx` with email/password/siteCode → JWT token flow.

### Logto Auth (OAuth/OIDC)
New authentication via Logto. See `docs/logto-integration-guide.md`.
- Config: `src/config/logto.config.ts` and `Backend/TaskFlow.API/appsettings.json`
- Components: `LogtoAuth.tsx`, `LogtoCallback.tsx`
- Backend: `LogtoController.cs` with `/api/auth/logto/sync` endpoint
- DB: `LogtoUserSiteMappings` table for multi-site user support

## Documentation

All docs in `./docs/`:
- `codebase-summary.md` - Full technical overview
- `logto-integration-guide.md` - OAuth/OIDC setup
- `design-guidelines.md` - UI/UX patterns

## Default Test Credentials

- Site Code: `DEMO` or `ACME`
- Email: `admin@demo.com` or `admin@acme.com`
- Password: `Admin@2025!`
