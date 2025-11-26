# Modern Task Management System v2.7

A powerful, multi-tenant task management platform built with React, .NET 8.0, and SQL Server. Features comprehensive project management, multiple workspace views (Kanban, Gantt, Mind Map), and real-time collaboration capabilities.

![Version](https://img.shields.io/badge/version-2.7-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoft-sql-server)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## Features

- **Multi-Tenant Architecture** - Complete isolation between organizations
- **Project Management** - Create, organize, and track projects with categories
- **Task Management** - Hierarchical tasks with subtasks, phases, and dependencies
- **Multiple Views** - Kanban board, Gantt chart, Mind map, and List view
- **Collaboration** - Team management, task comments, and activity tracking
- **Calendar Integration** - Event management with project/task linking
- **Authentication & Authorization** - JWT-based with role-based access control
- **Modern UI** - Built with shadcn/ui and Tailwind CSS
- **RESTful API** - Comprehensive .NET Web API with Swagger documentation
- **Docker Support** - Full containerized development and deployment

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- .NET 8.0 SDK
- SQL Server 2022 (or Docker)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Modern Task Management System_v2.7"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Frontend at `http://localhost:5600`
   - Backend API at `http://localhost:5001`
   - Swagger UI at `http://localhost:5001/swagger`
   - SQL Server at `localhost:1433`

4. **Or start services individually**

   **Backend:**
   ```bash
   cd Backend/TaskFlow.API
   dotnet restore
   dotnet run
   ```

   **Frontend:**
   ```bash
   npm run dev
   ```

### Default Login Credentials

After running the database initialization, use these credentials:

- **Site Code**: `DEMO`
- **Email**: `admin@demo.com`
- **Password**: `Admin@2025!`

## Development

### Frontend Development

```bash
npm run dev              # Start Vite dev server (port 5600)
npm run build            # Production build
npm run test             # Run E2E tests
```

### Backend Development

```bash
cd Backend/TaskFlow.API
dotnet run               # Start API server (port 5001)
dotnet build             # Compile project
dotnet watch run         # Start with hot reload
```

### Docker Commands

```bash
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:reset     # Reset and restart
npm run docker:logs      # View all logs
npm run docker:logs:backend  # Backend logs only
```

## Project Structure

```
Modern Task Management System_v2.7/
├── src/                       # React frontend
│   ├── components/            # React components
│   ├── services/              # API client
│   └── App.tsx                # Root component
├── Backend/                   # .NET backend
│   ├── TaskFlow.API/          # Web API project
│   │   ├── Controllers/       # API endpoints
│   │   ├── Models/            # Entities and DTOs
│   │   ├── Repositories/      # Data access
│   │   └── Services/          # Business logic
│   └── Database/              # SQL scripts
├── docs/                      # Documentation
├── docker-compose.yml         # Docker orchestration
├── package.json               # Frontend dependencies
└── vite.config.ts             # Vite configuration
```

## Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool with HMR
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend
- **.NET 8.0** - Web API framework
- **C# 12** - Modern language features
- **Dapper** - Lightweight ORM
- **SQL Server 2022** - Database
- **JWT Authentication** - Security
- **BCrypt** - Password hashing
- **Swagger/OpenAPI** - API documentation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PowerShell/Bash** - Automation scripts

## API Documentation

Once the backend is running, access the interactive API documentation:

**Swagger UI**: `http://localhost:5001/swagger`

### Main API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/projects` - List projects
- `GET /api/tasks` - List tasks
- `GET /api/events` - Calendar events
- `GET /api/users` - Team members

All endpoints require JWT authentication (except `/auth/login` and `/auth/register`).

## Configuration

### Environment Variables

**Backend** (appsettings.Development.json):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskFlowDB_Dev;..."
  },
  "Jwt": {
    "SecretKey": "YourSecretKeyHere32CharsMinimum!",
    "Issuer": "TaskFlowAPI_Dev",
    "Audience": "TaskFlowClient_Dev",
    "AccessTokenExpirationMinutes": 480,
    "RefreshTokenExpirationDays": 30
  }
}
```

**Frontend** (.env):
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=30000
```

## Multi-Tenancy

The system supports multiple organizations (tenants) in a shared database:

- Each tenant has a unique **Site Code** and **Site ID**
- All data is automatically isolated by tenant
- Users belong to a single tenant
- Database-level constraints enforce isolation

## Fixed Port Configuration (Required for Logto)

> ⚠️ **IMPORTANT**: The following ports are **fixed** and must not be changed because Logto OAuth has registered redirect URIs that depend on these specific ports.

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Frontend | 5600 | http://localhost:5600    |
| Backend  | 5001 | http://localhost:5001    |
| Logto    | 3001 | http://localhost:3001    |

### Logto Configuration

- **Endpoint**: `http://localhost:3001`
- **App ID**: `50u1lepjab2k72ijjf6li`
- **Redirect URI**: `http://localhost:5600/auth/callback`
- **Post Logout URI**: `http://localhost:5600`

If you need to change ports, you must update the redirect URIs in Logto Console and the following files:
- `vite.config.ts` - Frontend server port
- `Backend/TaskFlow.API/Properties/launchSettings.json` - Backend port
- `src/config/logto.config.ts` - Logto configuration
- `Backend/TaskFlow.API/appsettings.Development.json` - Logto and CORS settings

## Authentication Flow

### Legacy Auth (Email/Password)

1. User provides email, password, and site code
2. Backend validates credentials and generates JWT tokens
3. Frontend stores access token and refresh token
4. All API requests include Authorization header
5. Automatic token refresh on expiration

### Logto Auth (OAuth/OIDC)

1. User clicks "Sign in with Logto"
2. Redirects to Logto login page (`http://localhost:3001`)
3. After authentication, redirects back to `http://localhost:5600/auth/callback`
4. Frontend exchanges code for tokens via backend
5. Backend syncs user to local database with site mapping

## Key Features Explained

### Task Management
- Hierarchical tasks with unlimited subtasks
- Task phases for workflow organization
- Status tracking (To Do, In Progress, Review, Done)
- Priority levels and progress tracking
- Time estimation and actual hours
- Drag-and-drop reordering

### Workspace Views
- **List View**: Table with inline editing
- **Kanban Board**: Visual workflow with drag-and-drop
- **Gantt Chart**: Timeline visualization
- **Mind Map**: Hierarchical relationship view

### Project Organization
- Project categories and templates
- Budget tracking
- Date range management
- Team assignment
- Status and priority tracking

## Testing

### E2E Tests

Run end-to-end tests:
```bash
npm test
```

Tests include:
- User authentication
- Project CRUD operations
- Task management
- API integration

### Manual Testing

1. Use Swagger UI for API testing
2. Test HTML pages in project root
3. PowerShell scripts for database scenarios

## Troubleshooting

### Frontend Issues

**Port already in use:**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000
# Kill the process or use a different port in vite.config.ts
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules .vite
npm install
```

### Backend Issues

**Database connection failed:**
- Verify SQL Server is running
- Check connection string in appsettings.json
- Ensure database exists (run init-database.ps1)

**JWT authentication failed:**
- Verify JWT SecretKey is set (32+ characters)
- Check token expiration settings
- Clear browser localStorage and login again

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Reset everything
docker-compose down -v
docker-compose up -d --build
```

**Database initialization failed:**
```bash
# Check db-init service logs
docker-compose logs db-init

# Manually run initialization
./init-database.ps1
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Codebase Summary](./docs/codebase-summary.md)** - Technical overview
- **[Project Overview & PDR](./docs/project-overview-pdr.md)** - Requirements and specifications
- **[Code Standards](./docs/code-standards.md)** - Coding conventions
- **[System Architecture](./docs/system-architecture.md)** - Architecture patterns
- **[Project Roadmap](./docs/project-roadmap.md)** - Implementation status and future plans
- **[Deployment Guide](./docs/deployment-guide.md)** - Deployment procedures
- **[Design Guidelines](./docs/design-guidelines.md)** - UI/UX patterns

## Contributing

1. Follow the coding standards in `docs/code-standards.md`
2. Adhere to development rules in `.claude/workflows/development-rules.md`
3. Write tests for new features
4. Update documentation as needed
5. Create pull requests for review

## AI Agent Integration

This project includes comprehensive Claude AI agent configuration for development assistance:

- 15 specialized agent roles (Planner, Developer, Debugger, Tester, etc.)
- 30+ slash commands for common workflows
- 20+ skill libraries for specific tasks
- Detailed workflow documentation

See `.claude/` directory for agent configuration.

## License

[Specify your license here]

## Support

For issues and questions:
- Check the [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- Review [Documentation](./docs/)
- Open an issue on GitHub

## Acknowledgments

This project uses:
- [React](https://reactjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [.NET](https://dotnet.microsoft.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- And many other open-source libraries

---

**Version**: 2.7
**Last Updated**: 2025-10-30
**Original Design**: [Figma Project](https://www.figma.com/design/adsyzOXvBZHfpDBbYoJcg1/Modern-Task-Management-System_v2.3)
