# Logto Authentication Integration Guide

This guide explains how to configure and use Logto authentication in TaskFlow.

## Overview

TaskFlow supports OAuth/OIDC authentication via Logto, allowing users to sign in with:
- Email/password
- Social providers (Google, GitHub, Microsoft, etc.)
- Enterprise SSO (SAML, AD/LDAP)

## Features

✅ Database migration completed - LogtoUserID column and LogtoUserSiteMappings table added
✅ Backend API endpoints created (`/api/auth/logto/sync`, `/api/auth/logto/sites/{id}`)
✅ Frontend components created (LogtoAuth, LogtoCallback)
✅ Multi-site user assignment support
✅ Automatic user sync to TaskFlow database
⚠️ Requires Logto instance setup and configuration

---

## Backend Setup

### 1. Database Migration

The database migration script has been created and run:
- **File**: `Backend/Database/15_Logto_Integration.sql`
- **Changes**:
  - Added `LogtoUserID` column to `Users` table
  - Created `LogtoUserSiteMappings` table
  - Created stored procedures: `GetLogtoUserSites`, `SyncLogtoUser`, `DeactivateLogtoMapping`

To re-run the migration:
```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./run-logto-migration.ps1"
```

### 2. Backend Configuration

Update `Backend/TaskFlow.API/appsettings.json`:

```json
{
  "Logto": {
    "Endpoint": "https://your-logto-instance.logto.app",
    "AppId": "your-logto-app-id",
    "AppSecret": "your-logto-app-secret",
    "RedirectUri": "http://localhost:3000/auth/callback",
    "PostLogoutRedirectUri": "http://localhost:3000"
  }
}
```

### 3. Backend API Endpoints

The following endpoints are available:

#### POST `/api/auth/logto/sync`
Syncs Logto user to TaskFlow database and returns TaskFlow JWT token.

**Request:**
```json
{
  "logtoUserID": "string",
  "siteIdentifier": "ACME",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://avatar.url",
  "role": "Member",
  "logtoAccessToken": "logto-jwt-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "taskflow-jwt",
    "refreshToken": "refresh-token",
    "expiresIn": 3600,
    "user": { /* UserDto */ }
  }
}
```

#### GET `/api/auth/logto/sites/{logtoUserId}`
Gets all sites assigned to a Logto user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "mappingID": "guid",
      "logtoUserID": "string",
      "userID": "guid",
      "siteID": "guid",
      "siteCode": "ACME",
      "siteName": "ACME Corporation",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Member"
    }
  ]
}
```

---

## Frontend Setup

### 1. Environment Variables

Create `.env` file in project root (optional):

```env
VITE_LOGTO_ENDPOINT=https://your-logto-instance.logto.app
VITE_LOGTO_APP_ID=your-logto-app-id
VITE_API_BASE_URL=http://localhost:5001
```

### 2. Update App.tsx

Wrap your application with `LogtoProvider`:

```tsx
import { LogtoProvider } from '@logto/react';
import { logtoConfig } from './config/logto.config';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogtoAuth from './components/LogtoAuth';
import LogtoCallback from './components/LogtoCallback';

function App() {
  return (
    <LogtoProvider config={logtoConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogtoAuth />} />
          <Route path="/auth/callback" element={<LogtoCallback />} />
          <Route path="/workspace" element={<Workspace />} />
          {/* Other routes */}
        </Routes>
      </BrowserRouter>
    </LogtoProvider>
  );
}

export default App;
```

### 3. Configure Site Assignment Strategy

Edit `src/config/logto.config.ts`:

```typescript
// Choose your site assignment strategy:
export const siteAssignmentStrategy: 'custom-claim' | 'user-selection' | 'admin-mapping' = 'user-selection';
```

**Options:**
1. **`custom-claim`** - Read `siteCode` from Logto custom claims (requires Logto configuration)
2. **`user-selection`** - Let user select site after login (default, works out-of-the-box)
3. **`admin-mapping`** - Admin assigns site in backend (requires admin panel)

### 4. Update Logto Configuration

In `src/config/logto.config.ts`, update:

```typescript
export const logtoConfig: LogtoConfig = {
  endpoint: 'https://your-logto-instance.logto.app', // Your Logto endpoint
  appId: 'your-logto-app-id', // Your Logto app ID
  scopes: [
    UserScope.Email,
    UserScope.Profile,
    UserScope.CustomData,
  ],
  resources: ['http://localhost:5001'],
};
```

---

## Logto Console Setup

### 1. Create Logto Account

Choose one option:

**Option A: Logto Cloud (Recommended for quick start)**
1. Go to https://logto.io
2. Sign up for a free account
3. Create a new tenant

**Option B: Self-Hosted (For production or privacy)**
1. Follow https://docs.logto.io/docs/tutorials/get-started/self-hosting
2. Deploy Logto instance on your infrastructure

### 2. Create Application

1. In Logto Console, go to **Applications**
2. Click **Create Application**
3. Choose **Single Page Application (SPA)**
4. Name it "TaskFlow"
5. Note your **App ID** and **App Secret**

### 3. Configure Redirect URIs

In your Logto application settings:

**Redirect URIs:**
```
http://localhost:3000/auth/callback
http://your-production-domain.com/auth/callback
```

**Post Sign-Out Redirect URIs:**
```
http://localhost:3000/
http://your-production-domain.com/
```

### 4. Configure CORS

Add your frontend origins:
```
http://localhost:3000
http://your-production-domain.com
```

### 5. Optional: Add Custom Claims for Site Assignment

If using `custom-claim` strategy:

1. Go to **Sign-in Experience** → **Custom Claims**
2. Add custom claim `siteCode`:
   ```typescript
   {
     "siteCode": "ACME" // or dynamic based on user
   }
   ```

### 6. Optional: Configure Social Providers

1. Go to **Connectors**
2. Add social connectors (Google, GitHub, etc.)
3. Follow Logto's guides for each provider

---

## Site Assignment Strategies

### Strategy 1: User Selection (Default)

**Pros:**
- Works immediately without Logto configuration
- Users can access multiple sites
- Flexible and user-friendly

**Cons:**
- Users must select site on each login

**Implementation:**
```typescript
export const siteAssignmentStrategy = 'user-selection';
```

Users will see a site selection screen after Logto login.

### Strategy 2: Custom Claim

**Pros:**
- Automatic site assignment
- Single sign-on experience
- Site assignment controlled in Logto

**Cons:**
- Requires Logto custom claim configuration
- One site per user

**Implementation:**

1. Configure Logto custom claim `siteCode`
2. Update strategy:
```typescript
export const siteAssignmentStrategy = 'custom-claim';
```

### Strategy 3: Admin Mapping

**Pros:**
- Centralized control
- Audit trail in TaskFlow database

**Cons:**
- Requires admin panel implementation
- Manual site assignment

**Implementation:**
```typescript
export const siteAssignmentStrategy = 'admin-mapping';
```

Admins use TaskFlow admin panel to assign users to sites.

---

## Testing

### Test with Mock Logto Instance

1. Start backend: `cd Backend/TaskFlow.API && dotnet run`
2. Start frontend: `npm run dev`
3. Update `logto.config.ts` with test values
4. Navigate to `http://localhost:3000`
5. Click "Sign in with Logto"

### Verify Database Sync

After successful login:

```sql
-- Check user was synced
SELECT * FROM Users WHERE LogtoUserID IS NOT NULL;

-- Check site mapping
SELECT * FROM LogtoUserSiteMappings;
```

---

## Security Considerations

### Token Validation

The backend validates Logto JWT tokens using JWKS:
- Fetches public keys from `{logtoEndpoint}/oidc/jwks`
- Validates signature, issuer, audience, expiration
- Extracts user claims securely

### HTTPS in Production

⚠️ **Important**: Always use HTTPS in production!

Update `appsettings.json` for production:
```json
{
  "Logto": {
    "Endpoint": "https://your-logto-prod.logto.app",
    "RedirectUri": "https://yourdomain.com/auth/callback",
    "PostLogoutRedirectUri": "https://yourdomain.com"
  }
}
```

Update frontend config:
```typescript
const logtoConfig = {
  endpoint: 'https://your-logto-prod.logto.app',
  // ...
};
```

### Token Storage

TaskFlow JWT tokens are stored in localStorage:
- `accessToken` - TaskFlow JWT (expires in 60 minutes)
- `refreshToken` - Refresh token (7 days)
- `siteID` - User's assigned site ID
- `user` - User profile data

**Security Best Practice**: Consider migrating to HttpOnly cookies for production.

---

## Migration from Legacy Auth

### Dual-Mode Support

Both auth systems can coexist:

1. **Legacy users**: Continue using SimpleAuthReal.tsx
2. **New users**: Use LogtoAuth.tsx
3. **Gradual migration**: Link existing users to Logto via email match

### Migration Steps

1. **Phase 1**: Deploy Logto integration alongside existing auth
2. **Phase 2**: Invite users to link Logto accounts
3. **Phase 3**: Migrate users in backend:
   ```sql
   UPDATE Users
   SET LogtoUserID = @LogtoUserID
   WHERE Email = @Email AND SiteID = @SiteID;
   ```
4. **Phase 4**: Deprecate legacy auth

---

## Troubleshooting

### Issue: "Invalid Logto token"

**Solution**: Check Logto configuration matches backend:
- Endpoint URL is correct
- App ID matches
- JWKS endpoint is accessible

### Issue: "Invalid site identifier"

**Solution**: Ensure site exists in database:
```sql
SELECT * FROM Sites WHERE SiteCode = 'ACME';
```

### Issue: "User not syncing"

**Solution**: Check backend logs for errors. Verify:
- Database connection is working
- Stored procedure `SyncLogtoUser` exists
- Logto token is valid

### Issue: CORS errors

**Solution**: Add frontend origin to:
1. Backend CORS policy (`Program.cs`)
2. Logto application settings

---

## API Reference

### LogtoSyncDto

```csharp
{
  "logtoUserID": "string",      // Required - Logto sub claim
  "siteIdentifier": "string",   // Required - Site code or GUID
  "email": "string",            // Required - User email
  "name": "string",             // Required - Display name
  "avatar": "string?",          // Optional - Avatar URL
  "role": "string",             // Default: "Member"
  "logtoAccessToken": "string"  // Required - Logto JWT for validation
}
```

### LogtoSiteMappingDto

```csharp
{
  "mappingID": "guid",
  "logtoUserID": "string",
  "userID": "guid",
  "siteID": "guid",
  "siteCode": "string",
  "siteName": "string",
  "domain": "string?",
  "email": "string",
  "name": "string",
  "avatar": "string?",
  "role": "string",
  "isActive": "boolean",
  "createdAt": "datetime",
  "lastSyncAt": "datetime?"
}
```

---

## Next Steps

1. ✅ Set up Logto instance (Cloud or Self-Hosted)
2. ✅ Create application in Logto Console
3. ✅ Update configuration files
4. ✅ Test authentication flow
5. ⬜ Configure social providers (optional)
6. ⬜ Implement admin panel for site assignment (optional)
7. ⬜ Migrate existing users (if applicable)

For more information, see:
- Logto Documentation: https://docs.logto.io
- Logto React SDK: https://docs.logto.io/docs/recipes/integrate-logto/react
- TaskFlow Implementation Plan: `plans/251031-logto-auth-integration-plan.md`
