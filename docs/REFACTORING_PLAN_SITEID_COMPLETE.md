# 📋 Refactoring Plan: Đồng Nhất SiteID - Loại Bỏ SiteCode

**Ngày tạo:** 2025-01-31  
**Mục tiêu:** Thống nhất sử dụng **SiteID** (GUID) trong toàn bộ hệ thống, loại bỏ hoàn toàn **SiteCode** (string)

---

## 🎯 MỤC TIÊU

1. ✅ Loại bỏ hoàn toàn SiteCode khỏi authentication flow
2. ✅ Chỉ sử dụng SiteID (GUID) trong toàn bộ API
3. ✅ Frontend dùng SiteID thay vì SiteCode
4. ✅ JWT token chỉ chứa siteId claim (không có siteCode)
5. ✅ UserDto không còn SiteCode field
6. ✅ Tạo endpoint `/api/sites/public` để frontend lấy danh sách sites

---

## 📊 PHẠM VI THAY ĐỔI

### Backend Files Cần Sửa (15 files)
- DTOs: LoginDto, RegisterDto, UserDto
- Services: AuthService, TokenService, LogtoAuthService
- Controllers: AuthController, UsersController, ApiControllerBase
- Models: UserDto (Auth), UserDto (User)

### Frontend Files Cần Sửa (6 files)
- `src/services/api.ts` - TokenManager, authApi
- `src/components/SimpleAuthReal.tsx` - Login form
- `src/components/LogtoAuth.tsx` - Logto integration
- `src/config/logto.config.ts` - Site extraction
- Các components khác sử dụng SiteCode

### Database
- Không cần thay đổi schema
- Có thể thêm endpoint để query sites

---

## 🔧 CHI TIẾT THAY ĐỔI

### 1. BACKEND CHANGES

#### 1.1 DTOs

**File: `Backend/TaskFlow.API/Models/DTOs/Auth/LoginDto.cs`**

**TRƯỚC:**
```csharp
public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid? SiteID { get; set; }        // Optional
    public string? SiteCode { get; set; }    // ❌ XÓA
}
```

**SAU:**
```csharp
public class LoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(3, ErrorMessage = "Password must be at least 3 characters")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Site ID is required")]
    public Guid SiteID { get; set; }  // ✅ Required, không còn optional
}
```

**File: `Backend/TaskFlow.API/Models/DTOs/Auth/RegisterDto.cs`**

**TRƯỚC:**
```csharp
public class RegisterDto
{
    public Guid SiteID { get; set; }  // ✅ Đã đúng
    // ... other fields
}
```

**SAU:**
```csharp
// ✅ Không cần thay đổi, đã dùng SiteID
```

**File: `Backend/TaskFlow.API/Models/DTOs/Auth/UserDto.cs`**

**TRƯỚC:**
```csharp
public class UserDto
{
    public Guid UserID { get; set; }
    public Guid SiteID { get; set; }
    // ... other fields
    public string SiteCode { get; set; } = string.Empty;  // ❌ XÓA
    public string SiteName { get; set; } = string.Empty;  // ⚠️ Có thể giữ để display
}
```

**SAU:**
```csharp
public class UserDto
{
    public Guid UserID { get; set; }
    public Guid SiteID { get; set; }
    // ... other fields
    // ❌ XÓA: public string SiteCode
    public string SiteName { get; set; } = string.Empty;  // ✅ Giữ để display (optional)
}
```

---

#### 1.2 Services

**File: `Backend/TaskFlow.API/Services/AuthService.cs`**

**TRƯỚC:**
```csharp
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // Resolve SiteID from SiteCode if needed
    Guid siteId;
    if (loginDto.SiteID.HasValue && loginDto.SiteID.Value != Guid.Empty)
    {
        siteId = loginDto.SiteID.Value;
    }
    else if (!string.IsNullOrEmpty(loginDto.SiteCode))
    {
        var site = await GetSiteByCodeAsync(loginDto.SiteCode);
        if (site == null)
            throw new UnauthorizedAccessException("Invalid site code");
        siteId = site.SiteID;
    }
    else
    {
        throw new UnauthorizedAccessException("Site ID or Site Code is required");
    }
    // ...
}
```

**SAU:**
```csharp
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // Validate SiteID exists and is active
    var site = await GetSiteByIdAsync(loginDto.SiteID);
    if (site == null || !site.IsActive)
    {
        _logger.LogWarning("Login attempt with invalid site ID: {SiteID}", loginDto.SiteID);
        throw new UnauthorizedAccessException("Invalid site");
    }

    // Get user by email and site
    var user = await _userRepository.GetByEmailAsync(loginDto.SiteID, loginDto.Email);
    if (user == null)
    {
        _logger.LogWarning("Login attempt with non-existent email: {Email} at site {SiteID}", 
            loginDto.Email, loginDto.SiteID);
        throw new UnauthorizedAccessException("Invalid email or password");
    }

    // Verify password
    if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
    {
        _logger.LogWarning("Login attempt with incorrect password for user: {Email}", loginDto.Email);
        throw new UnauthorizedAccessException("Invalid email or password");
    }

    // Check if user is active
    if (user.Status != "Active")
    {
        _logger.LogWarning("Login attempt for inactive user: {Email}", loginDto.Email);
        throw new UnauthorizedAccessException("User account is not active");
    }

    // Update last active
    await _userRepository.UpdateLastActiveAsync(loginDto.SiteID, user.UserID);

    // Generate tokens
    var accessToken = _tokenService.GenerateAccessToken(user);
    var refreshToken = _tokenService.GenerateRefreshToken();

    var jwtSettings = _configuration.GetSection("Jwt");
    var expirationMinutes = int.Parse(jwtSettings["AccessTokenExpirationMinutes"] ?? "480");

    _logger.LogInformation("User {UserId} logged in successfully at site {SiteID}", 
        user.UserID, loginDto.SiteID);

    return new AuthResponseDto
    {
        AccessToken = accessToken,
        RefreshToken = refreshToken,
        ExpiresIn = expirationMinutes * 60,
        User = MapUserToDto(user, site)  // Pass site để populate SiteName
    };
}

// Update MapUserToDto
private UserDto MapUserToDto(User user, Site? site = null)
{
    return new UserDto
    {
        UserID = user.UserID,
        SiteID = user.SiteID,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        Status = user.Status,
        Avatar = user.Avatar,
        LastActive = user.LastActive,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt,
        SiteName = site?.SiteName ?? string.Empty  // ✅ Populate nếu có
    };
}

// ❌ XÓA method này:
// private async Task<Site?> GetSiteByCodeAsync(string siteCode)
```

**File: `Backend/TaskFlow.API/Services/TokenService.cs`**

**TRƯỚC:**
```csharp
public string GenerateAccessToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("siteId", user.SiteID.ToString()),
        new Claim("userId", user.UserID.ToString())
        // ✅ Đã không có siteCode claim
    };
    // ...
}
```

**SAU:**
```csharp
// ✅ Không cần thay đổi, đã đúng
```

---

#### 1.3 Controllers

**File: `Backend/TaskFlow.API/Controllers/Base/ApiControllerBase.cs`**

**TRƯỚC:**
```csharp
protected string GetSiteCode()
{
    return User.FindFirst("siteCode")?.Value ?? string.Empty;  // ❌ XÓA method này
}
```

**SAU:**
```csharp
// ❌ XÓA method GetSiteCode() hoàn toàn
// Chỉ giữ lại GetSiteId()
```

**File: `Backend/TaskFlow.API/Controllers/UsersController.cs`**

**TRƯỚC:**
```csharp
var userDtos = users.Select(u => new UserDto
{
    // ... other fields
    SiteCode = string.Empty,  // ❌ XÓA
    SiteName = string.Empty
});
```

**SAU:**
```csharp
// Option 1: Không populate SiteName (simple)
var userDtos = users.Select(u => new UserDto
{
    // ... other fields
    SiteName = string.Empty  // ✅ Giữ nếu muốn display
});

// Option 2: Populate SiteName (better UX)
var siteId = GetSiteId();
var site = await GetSiteByIdAsync(siteId);  // Query once
var userDtos = users.Select(u => new UserDto
{
    // ... other fields
    SiteName = site?.SiteName ?? string.Empty
});
```

**File: `Backend/TaskFlow.API/Controllers/AuthController.cs`**

**TRƯỚC:**
```csharp
// ✅ Không cần thay đổi nhiều, chỉ update comments
```

**SAU:**
```csharp
// Update XML comments để reflect SiteID only
```

---

#### 1.4 New Endpoint: Public Sites List

**File: `Backend/TaskFlow.API/Controllers/SitesController.cs` (NEW)**

Tạo controller mới để frontend lấy danh sách sites:

```csharp
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.Entities;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Public sites endpoint - No authentication required
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SitesController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SitesController> _logger;

        public SitesController(
            IConfiguration configuration,
            ILogger<SitesController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Get all active sites (public endpoint for login form)
        /// </summary>
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<PublicSiteDto>>>> GetPublicSites()
        {
            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                using var connection = new SqlConnection(connectionString);

                var sql = @"
                    SELECT SiteID, SiteCode, SiteName, Domain
                    FROM Sites
                    WHERE IsActive = 1
                    ORDER BY SiteName";

                var sites = await connection.QueryAsync<PublicSiteDto>(sql);

                return Ok(ApiResponse<IEnumerable<PublicSiteDto>>.SuccessResponse(
                    sites, 
                    "Sites retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public sites");
                return StatusCode(500, ApiResponse<IEnumerable<PublicSiteDto>>.ErrorResponse(
                    "Error retrieving sites"));
            }
        }
    }

    /// <summary>
    /// Public site DTO (only expose necessary fields)
    /// </summary>
    public class PublicSiteDto
    {
        public Guid SiteID { get; set; }
        public string SiteCode { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
        public string? Domain { get; set; }
    }
}
```

**Lý do:**
- Frontend cần biết danh sách sites để hiển thị dropdown
- Không cần authentication (public endpoint)
- Chỉ expose SiteID, SiteCode (để display), SiteName, Domain

---

### 2. FRONTEND CHANGES

#### 2.1 API Client

**File: `src/services/api.ts`**

**TRƯỚC:**
```typescript
class TokenManager {
  private static readonly SITE_CODE_KEY = 'taskflow_site_code';

  static getSiteCode(): string | null {
    return localStorage.getItem(this.SITE_CODE_KEY);
  }

  static setSiteCode(siteCode: string): void {
    localStorage.setItem(this.SITE_CODE_KEY, siteCode);
  }

  static clearAll(): void {
    // ...
    localStorage.removeItem(this.SITE_CODE_KEY);  // ❌ XÓA
  }
}

export const authApi = {
  async login(email: string, password: string, siteCodeOrID: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
      email,
      password,
      SiteCode: siteCodeOrID,  // ❌ XÓA
    });
    
    TokenManager.setSiteCode(siteCodeOrID);  // ❌ XÓA
    // ...
  },
};
```

**SAU:**
```typescript
class TokenManager {
  private static readonly SITE_ID_KEY = 'taskflow_site_id';  // ✅ Đổi tên

  static getSiteId(): string | null {
    return localStorage.getItem(this.SITE_ID_KEY);
  }

  static setSiteId(siteId: string): void {
    localStorage.setItem(this.SITE_ID_KEY, siteId);
  }

  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SITE_ID_KEY);  // ✅ Update
  }
}

// Add Sites API
export interface PublicSite {
  siteID: string;
  siteCode: string;  // Chỉ để display
  siteName: string;
  domain?: string;
}

export const sitesApi = {
  async getPublicSites(): Promise<PublicSite[]> {
    const response = await client.get<PublicSite[]>('/sites/public');
    return response.data || [];
  },
};

// Update Auth API
export const authApi = {
  async login(email: string, password: string, siteId: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
      email,
      password,
      siteID: siteId,  // ✅ Đổi tên
    });

    if (response.success && response.data) {
      TokenManager.setAccessToken(response.data.accessToken);
      TokenManager.setRefreshToken(response.data.refreshToken);
      TokenManager.setUser(response.data.user);
      TokenManager.setSiteId(siteId);  // ✅ Store SiteID
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  },

  async register(
    email: string,
    password: string,
    name: string,
    siteId: string  // ✅ Đã đúng
  ): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      siteID: siteId,  // ✅ Đã đúng
    });

    if (response.success && response.data) {
      TokenManager.setAccessToken(response.data.accessToken);
      TokenManager.setRefreshToken(response.data.refreshToken);
      TokenManager.setUser(response.data.user);
      TokenManager.setSiteId(siteId);  // ✅ Store SiteID
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  },
};
```

---

#### 2.2 Login Component

**File: `src/components/SimpleAuthReal.tsx`**

**TRƯỚC:**
```typescript
const DEFAULT_SITE_CODE = 'ACME';

const [formData, setFormData] = useState({
  siteCode: DEFAULT_SITE_CODE,  // ❌ XÓA
  email: 'admin@acme.com',
  password: 'admin123',
});

const handleSignIn = async (e: React.FormEvent) => {
  const response = await authApi.login(
    formData.email.trim(),
    formData.password,
    formData.siteCode.trim()  // ❌ XÓA
  );
};
```

**SAU:**
```typescript
import { sitesApi, PublicSite } from '../services/api';

// Default SiteID for ACME (lấy từ database hoặc config)
const DEFAULT_SITE_ID = 'YOUR_ACME_SITE_ID_HERE';  // TODO: Replace with actual GUID

export function SimpleAuthReal({ onAuthSuccess }: SimpleAuthRealProps) {
  const [sites, setSites] = useState<PublicSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteId: DEFAULT_SITE_ID,  // ✅ Đổi thành SiteID
    email: 'admin@acme.com',
    password: 'admin123',
    name: ''
  });

  // Load sites on mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sitesList = await sitesApi.getPublicSites();
        setSites(sitesList);
        // Set default site if available
        if (sitesList.length > 0 && !formData.siteId) {
          setFormData(prev => ({ ...prev, siteId: sitesList[0].siteID }));
        }
      } catch (error) {
        console.error('Failed to load sites:', error);
      }
    };
    loadSites();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(
        formData.email.trim(),
        formData.password,
        formData.siteId  // ✅ Dùng SiteID
      );
      // ...
    } catch (err) {
      // ...
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      {/* Site Selection Dropdown */}
      <Select
        value={formData.siteId}
        onValueChange={(value) => setFormData({...formData, siteId: value})}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Site" />
        </SelectTrigger>
        <SelectContent>
          {sites.map((site) => (
            <SelectItem key={site.siteID} value={site.siteID}>
              {site.siteName} ({site.siteCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Email, Password inputs... */}
    </form>
  );
}
```

---

#### 2.3 Logto Integration

**File: `src/components/LogtoAuth.tsx`**

**TRƯỚC:**
```typescript
interface Site {
  siteID: string;
  siteCode: string;  // ⚠️ Có thể giữ để display
  siteName: string;
}

// Usage
{site.siteCode}  // Display
```

**SAU:**
```typescript
interface Site {
  siteID: string;
  siteCode: string;  // ✅ Giữ để display trong UI
  siteName: string;
}

// Usage - vẫn dùng siteCode để display, nhưng logic dùng siteID
<SelectItem value={site.siteID}>  // ✅ Value là SiteID
  {site.siteName} ({site.siteCode})  // Display vẫn có SiteCode
</SelectItem>
```

**File: `src/config/logto.config.ts`**

**TRƯỚC:**
```typescript
export function extractSiteFromClaims(claims: Record<string, unknown>): string | null {
  if (claims.siteCode && typeof claims.siteCode === 'string') {
    return claims.siteCode;  // ❌ XÓA
  }
  if (claims.siteId && typeof claims.siteId === 'string') {
    return claims.siteId;  // ✅ Giữ
  }
  return null;
}
```

**SAU:**
```typescript
export function extractSiteFromClaims(claims: Record<string, unknown>): string | null {
  // Chỉ dùng siteId từ claims
  if (claims.siteId && typeof claims.siteId === 'string') {
    return claims.siteId;  // ✅ Chỉ dùng SiteID
  }
  return null;
}
```

---

### 3. DATABASE

**Không cần thay đổi schema.**

**Có thể thêm index nếu chưa có:**
```sql
-- Sites table đã có SiteID là PK, không cần thêm index
-- Chỉ cần đảm bảo IsActive có index nếu query nhiều
CREATE NONCLUSTERED INDEX IX_Sites_IsActive 
ON Sites(IsActive) 
WHERE IsActive = 1;
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Backend Changes

#### DTOs
- [ ] Update `LoginDto.cs` - Remove SiteCode, make SiteID required
- [ ] Update `UserDto.cs` (Auth) - Remove SiteCode field
- [ ] Verify `RegisterDto.cs` - Already uses SiteID ✅

#### Services
- [ ] Update `AuthService.LoginAsync()` - Remove SiteCode logic
- [ ] Remove `GetSiteByCodeAsync()` method from AuthService
- [ ] Update `MapUserToDto()` - Remove SiteCode, optionally populate SiteName
- [ ] Verify `TokenService` - Already correct ✅

#### Controllers
- [ ] Remove `GetSiteCode()` from `ApiControllerBase`
- [ ] Update `UsersController` - Remove SiteCode from UserDto mapping
- [ ] Create new `SitesController` with `/api/sites/public` endpoint
- [ ] Update XML comments in `AuthController`

#### Testing
- [ ] Test login with SiteID
- [ ] Test login with invalid SiteID
- [ ] Test register with SiteID
- [ ] Test `/api/sites/public` endpoint
- [ ] Verify JWT token only has siteId claim

---

### Phase 2: Frontend Changes

#### API Client
- [ ] Update `TokenManager` - Rename SITE_CODE_KEY to SITE_ID_KEY
- [ ] Remove `getSiteCode()` and `setSiteCode()` methods
- [ ] Add `getSiteId()` and `setSiteId()` methods
- [ ] Update `authApi.login()` - Change parameter to siteId
- [ ] Update `authApi.register()` - Verify uses siteId
- [ ] Add `sitesApi.getPublicSites()` method

#### Components
- [ ] Update `SimpleAuthReal.tsx` - Change formData.siteCode to siteId
- [ ] Add sites dropdown using `sitesApi.getPublicSites()`
- [ ] Update `LogtoAuth.tsx` - Use siteID for value, siteCode only for display
- [ ] Update `logto.config.ts` - Remove siteCode extraction logic

#### Testing
- [ ] Test login flow with SiteID dropdown
- [ ] Test register flow with SiteID
- [ ] Verify sites dropdown loads correctly
- [ ] Test token storage (should store SiteID, not SiteCode)

---

### Phase 3: Cleanup

- [ ] Remove all references to SiteCode in comments
- [ ] Update documentation
- [ ] Remove unused SiteCode constants
- [ ] Search codebase for any remaining SiteCode usage
- [ ] Update README with new authentication flow

---

## 🚨 BREAKING CHANGES

### API Contract Changes

**Before:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "siteCode": "ACME"  // ❌
}
```

**After:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "siteID": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"  // ✅
}
```

### Frontend Impact

- ❌ All login/register calls must be updated
- ❌ UI must change from SiteCode input to SiteID dropdown
- ❌ localStorage key changes from `taskflow_site_code` to `taskflow_site_id`

### Migration Strategy

**Option A: Big Bang (Recommended for dev)**
1. Update all backend code
2. Update all frontend code
3. Deploy together
4. Test end-to-end

**Option B: Backward Compatible (If needed)**
1. Backend accept both SiteID and SiteCode temporarily
2. Frontend migrate gradually
3. Remove SiteCode support after migration complete

**Recommendation: Option A** - Clean break, easier to maintain

---

## 📝 SITEID VALUES

**Get from database:**
```sql
SELECT SiteID, SiteCode, SiteName 
FROM Sites 
WHERE IsActive = 1;
```

**Example:**
```
SiteID                                  SiteCode  SiteName
--------------------------------------  --------  --------------------
A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6   ACME      ACME Corporation
B2C3D4E5-F6G7-H8I9-J0K1-L2M3N4O5P6Q7   TECHSTART Tech Startup Inc
```

**Frontend Options:**
1. **Hardcode** - Put SiteIDs in config file
2. **Fetch** - Use `/api/sites/public` endpoint (Recommended)
3. **Environment Variables** - Store in .env file

**Recommendation:** Use `/api/sites/public` endpoint for flexibility

---

## 🎯 UI/UX RECOMMENDATIONS

### Login Form Design

**Option 1: Dropdown (Recommended)**
```tsx
<Select value={siteId} onValueChange={setSiteId}>
  <SelectItem value="site-id-1">ACME Corporation</SelectItem>
  <SelectItem value="site-id-2">Tech Startup Inc</SelectItem>
</Select>
```

**Option 2: Radio Buttons**
```tsx
{sites.map(site => (
  <RadioGroupItem value={site.siteID}>
    {site.siteName} ({site.siteCode})
  </RadioGroupItem>
))}
```

**Option 3: Quick Login Buttons (For Testing)**
```tsx
<Button onClick={() => handleQuickLogin(ACME_SITE_ID)}>
  Quick Login: ACME
</Button>
```

**Recommendation:** Dropdown with SiteName display, SiteCode in parentheses

---

## 📋 TESTING CHECKLIST

### Backend Tests
- [ ] Login with valid SiteID → Success
- [ ] Login with invalid SiteID → Error
- [ ] Login with non-existent SiteID → Error
- [ ] Register with valid SiteID → Success
- [ ] Register with invalid SiteID → Error
- [ ] `/api/sites/public` returns active sites
- [ ] JWT token contains siteId claim (not siteCode)
- [ ] UserDto does not contain SiteCode field

### Frontend Tests
- [ ] Sites dropdown loads on mount
- [ ] Login with selected SiteID → Success
- [ ] Register with selected SiteID → Success
- [ ] SiteID stored in localStorage after login
- [ ] Token contains correct siteId
- [ ] Logout clears SiteID from localStorage

### Integration Tests
- [ ] End-to-end login flow
- [ ] Multi-tenant isolation still works
- [ ] User can only access their site's data

---

## 📚 DOCUMENTATION UPDATES

- [ ] Update `README.md` - Authentication section
- [ ] Update `Backend/README.md` - API documentation
- [ ] Update `docs/SITEID_SITECODE_GAP_ANALYSIS.md` - Mark as resolved
- [ ] Update `docs/PROJECT_REVIEW_REPORT.md` - Mark GAP as fixed
- [ ] Create migration guide for existing users (if any)

---

## ⚡ QUICK START GUIDE

### For Developers

1. **Backend:**
   ```bash
   cd Backend/TaskFlow.API
   # Make changes according to checklist
   dotnet build
   dotnet run
   ```

2. **Frontend:**
   ```bash
   npm install
   # Make changes according to checklist
   npm run dev
   ```

3. **Test:**
   - Open login page
   - Select site from dropdown
   - Login with credentials
   - Verify JWT contains siteId (not siteCode)

---

## 🎯 SUCCESS CRITERIA

- ✅ No SiteCode in authentication flow
- ✅ All API calls use SiteID
- ✅ JWT token only contains siteId claim
- ✅ UserDto does not have SiteCode field
- ✅ Frontend uses SiteID dropdown
- ✅ `/api/sites/public` endpoint works
- ✅ All tests pass
- ✅ Documentation updated

---

**Status:** Ready for Implementation  
**Priority:** 🔴 HIGH  
**Estimated Time:** 4-6 hours

