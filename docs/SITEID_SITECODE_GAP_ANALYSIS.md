# Phân Tích GAP: SiteID vs SiteCode

**Ngày phân tích:** 2025-01-31  
**Mức độ:** 🔴 CRITICAL - Inconsistency giữa SiteID và SiteCode

---

## 🎯 TÓM TẮT VẤN ĐỀ

Có **GAP nghiêm trọng** giữa cách sử dụng `SiteID` (GUID) và `SiteCode` (string) trong hệ thống:

1. ❌ **JWT Token** không chứa `siteCode` claim nhưng code cố gắng đọc
2. ❌ **UserDto** có field `SiteCode` nhưng luôn trả về empty string
3. ❌ **Frontend** store `SiteCode` nhưng backend không populate
4. ⚠️ **Inconsistency**: Login có thể dùng SiteCode, Register chỉ dùng SiteID
5. ⚠️ **TokenService** không add `siteCode` vào JWT claims

---

## 📊 PHÂN TÍCH CHI TIẾT

### 1. JWT Token Claims

**Current Implementation:**
```csharp
// TokenService.cs - Line 34-42
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Name, user.Name),
    new Claim(ClaimTypes.Role, user.Role),
    new Claim("siteId", user.SiteID.ToString()),  // ✅ Có
    new Claim("userId", user.UserID.ToString())
    // ❌ THIẾU: new Claim("siteCode", siteCode)
};
```

**Vấn đề:**
- JWT token **KHÔNG có** `siteCode` claim
- Nhưng `ApiControllerBase.GetSiteCode()` cố gắng đọc từ JWT:
```csharp
// ApiControllerBase.cs - Line 83-86
protected string GetSiteCode()
{
    return User.FindFirst("siteCode")?.Value ?? string.Empty;  // ❌ Luôn trả về empty
}
```

**Kết quả:** `GetSiteCode()` luôn trả về empty string.

---

### 2. Login Flow - Dual Support

**LoginDto Structure:**
```csharp
// LoginDto.cs
public class LoginDto
{
    public Guid? SiteID { get; set; }      // ✅ Optional
    public string? SiteCode { get; set; }   // ✅ Optional
}
```

**AuthService.LoginAsync():**
```csharp
// AuthService.cs - Line 37-56
Guid siteId;
if (loginDto.SiteID.HasValue && loginDto.SiteID.Value != Guid.Empty)
{
    siteId = loginDto.SiteID.Value;  // ✅ Dùng SiteID nếu có
}
else if (!string.IsNullOrEmpty(loginDto.SiteCode))
{
    var site = await GetSiteByCodeAsync(loginDto.SiteCode);  // ✅ Convert SiteCode → SiteID
    if (site == null)
        throw new UnauthorizedAccessException("Invalid site code");
    siteId = site.SiteID;
}
else
{
    throw new UnauthorizedAccessException("Site ID or Site Code is required");
}
```

**Vấn đề:**
- ✅ Backend hỗ trợ CẢ HAI SiteID và SiteCode
- ❌ Nhưng sau khi convert, **không lưu SiteCode vào JWT**
- ❌ Không populate SiteCode vào UserDto response

---

### 3. Register Flow - Chỉ SiteID

**RegisterDto Structure:**
```csharp
// RegisterDto.cs
public class RegisterDto
{
    public Guid SiteID { get; set; }  // ✅ Required, không có SiteCode option
}
```

**Vấn đề:**
- ⚠️ Register **chỉ** accept SiteID, không có SiteCode option
- ⚠️ Inconsistency với Login (hỗ trợ cả hai)

---

### 4. UserDto Response - SiteCode Empty

**UserDto Definition:**
```csharp
// UserDto.cs
public class UserDto
{
    public Guid SiteID { get; set; }
    public string SiteCode { get; set; } = string.Empty;  // ✅ Có field
    public string SiteName { get; set; } = string.Empty;
}
```

**Mapping Implementation:**
```csharp
// AuthService.cs - Line 229-243
private UserDto MapUserToDto(User user)
{
    return new UserDto
    {
        UserID = user.UserID,
        SiteID = user.SiteID,
        // ... other fields
        // ❌ SiteCode = string.Empty  (không populate)
        // ❌ SiteName = string.Empty  (không populate)
    };
}
```

**Vấn đề:**
- UserDto có field `SiteCode` và `SiteName`
- Nhưng mapping **KHÔNG populate** các giá trị này
- Luôn trả về empty string

**Tương tự trong UsersController:**
```csharp
// UsersController.cs - Line 38-51
var userDtos = users.Select(u => new UserDto
{
    // ... other fields
    SiteCode = string.Empty,  // ❌ Hardcoded empty
    SiteName = string.Empty   // ❌ Hardcoded empty
});
```

---

### 5. Frontend Usage

**Frontend Login:**
```typescript
// api.ts - Line 261-277
async login(email: string, password: string, siteCodeOrID: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
        email,
        password,
        SiteCode: siteCodeOrID,  // ✅ Gửi SiteCode
    });
    
    // ...
    TokenManager.setSiteCode(siteCodeOrID);  // ✅ Store SiteCode trong localStorage
}
```

**Frontend Storage:**
```typescript
// api.ts - TokenManager
static getSiteCode(): string | null {
    return localStorage.getItem(this.SITE_CODE_KEY);
}

static setSiteCode(siteCode: string): void {
    localStorage.setItem(this.SITE_CODE_KEY, siteCode);
}
```

**Vấn đề:**
- Frontend **gửi SiteCode** để login
- Frontend **store SiteCode** trong localStorage
- Nhưng backend **không trả về SiteCode** trong response
- Frontend phải tự maintain SiteCode, không sync với backend

---

### 6. ApiControllerBase.GetSiteCode()

**Implementation:**
```csharp
// ApiControllerBase.cs - Line 83-86
protected string GetSiteCode()
{
    return User.FindFirst("siteCode")?.Value ?? string.Empty;
}
```

**Vấn đề:**
- Method này **KHÔNG BAO GIỜ hoạt động** vì JWT không có `siteCode` claim
- Luôn trả về empty string
- Code này là **dead code** hoặc **bug tiềm ẩn**

---

## 🔍 ROOT CAUSE ANALYSIS

### Vấn đề chính:

1. **Thiếu synchronization** giữa SiteID và SiteCode
   - Backend convert SiteCode → SiteID khi login
   - Nhưng không lưu SiteCode vào JWT hoặc response

2. **Incomplete mapping**
   - UserDto có SiteCode field nhưng không populate
   - Cần query Site table để lấy SiteCode từ SiteID

3. **JWT claims incomplete**
   - TokenService không add siteCode claim
   - ApiControllerBase.GetSiteCode() không hoạt động

4. **Frontend-Backend mismatch**
   - Frontend dùng SiteCode
   - Backend chủ yếu dùng SiteID
   - Không có mechanism để sync

---

## ⚠️ IMPACT

### 1. Functional Issues
- ❌ `ApiControllerBase.GetSiteCode()` không hoạt động
- ❌ UserDto.SiteCode luôn empty, frontend không biết SiteCode
- ❌ Frontend phải maintain SiteCode riêng, dễ mất sync

### 2. Security Issues
- ⚠️ Frontend store SiteCode trong localStorage (có thể bị XSS)
- ⚠️ Không có validation SiteCode trong JWT

### 3. Maintainability Issues
- ⚠️ Code confusion: có method GetSiteCode() nhưng không hoạt động
- ⚠️ Inconsistency giữa Login (dual support) và Register (SiteID only)

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### Option 1: Populate SiteCode vào JWT và UserDto (Recommended)

**1.1 Update TokenService:**
```csharp
// TokenService.cs
public string GenerateAccessToken(User user, string siteCode)
{
    var claims = new List<Claim>
    {
        // ... existing claims
        new Claim("siteId", user.SiteID.ToString()),
        new Claim("siteCode", siteCode),  // ✅ ADD
    };
    // ...
}
```

**1.2 Update AuthService:**
```csharp
// AuthService.cs - LoginAsync()
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // ... existing code to resolve siteId
    
    var site = await GetSiteByIdAsync(siteId);  // Get full site object
    
    // Generate token with siteCode
    var accessToken = _tokenService.GenerateAccessToken(user, site.SiteCode);
    
    // Map UserDto with SiteCode
    var userDto = MapUserToDto(user, site);
    // ...
}

private UserDto MapUserToDto(User user, Site site)
{
    return new UserDto
    {
        // ... existing fields
        SiteCode = site.SiteCode,    // ✅ Populate
        SiteName = site.SiteName,   // ✅ Populate
    };
}
```

**1.3 Update UsersController:**
```csharp
// UsersController.cs
public async Task<ActionResult> GetAll()
{
    var siteId = GetSiteId();
    var site = await GetSiteByIdAsync(siteId);  // Get site info
    var users = await _userRepository.GetAllAsync(siteId);
    
    var userDtos = users.Select(u => new UserDto
    {
        // ... existing fields
        SiteCode = site.SiteCode,    // ✅ Populate
        SiteName = site.SiteName,    // ✅ Populate
    });
}
```

**Pros:**
- ✅ JWT có đầy đủ thông tin
- ✅ UserDto có SiteCode
- ✅ Frontend không cần maintain riêng
- ✅ ApiControllerBase.GetSiteCode() hoạt động

**Cons:**
- ⚠️ Cần thêm database query để lấy Site info
- ⚠️ Cần update nhiều nơi

---

### Option 2: Standardize trên SiteID (Alternative)

**2.1 Remove SiteCode support:**
- LoginDto chỉ accept SiteID
- Remove SiteCode từ UserDto
- Frontend chuyển sang dùng SiteID

**Pros:**
- ✅ Đơn giản hơn
- ✅ Consistent với database (SiteID là PK)
- ✅ Performance tốt hơn (không cần lookup)

**Cons:**
- ⚠️ Breaking change cho frontend
- ⚠️ User phải nhập GUID (khó dùng)

---

### Option 3: Hybrid - SiteCode chỉ cho Login UI

**3.1 Keep SiteCode cho Login:**
- Login có thể dùng SiteCode (user-friendly)
- Convert SiteCode → SiteID ngay khi login
- Sau đó chỉ dùng SiteID trong toàn bộ system

**3.2 Populate SiteCode vào JWT và UserDto:**
- Query Site table để lấy SiteCode
- Add vào JWT và UserDto
- Frontend có thể display SiteCode nhưng logic dùng SiteID

**Pros:**
- ✅ User-friendly (có thể nhập SiteCode)
- ✅ Consistent internally (dùng SiteID)
- ✅ Frontend có SiteCode để display

**Cons:**
- ⚠️ Vẫn cần query Site table

---

## 🎯 KHUYẾN NGHỊ

**Recommendation: Option 3 (Hybrid)**

1. ✅ **Giữ SiteCode cho Login** - User-friendly
2. ✅ **Populate SiteCode vào JWT** - ApiControllerBase.GetSiteCode() hoạt động
3. ✅ **Populate SiteCode vào UserDto** - Frontend có thông tin
4. ✅ **Internal logic dùng SiteID** - Consistent với database

**Implementation Priority:**
1. 🔴 **HIGH**: Fix TokenService để add siteCode vào JWT
2. 🔴 **HIGH**: Fix UserDto mapping để populate SiteCode
3. 🟡 **MEDIUM**: Update UsersController để populate SiteCode
4. 🟢 **LOW**: Consider caching Site info để tránh query nhiều lần

---

## 📋 CHECKLIST IMPLEMENTATION

### Backend Changes

- [ ] Update `TokenService.GenerateAccessToken()` - Add siteCode parameter
- [ ] Update `AuthService.LoginAsync()` - Get Site object và pass siteCode
- [ ] Update `AuthService.MapUserToDto()` - Add Site parameter và populate SiteCode/SiteName
- [ ] Update `UsersController.GetAll()` - Query Site và populate SiteCode
- [ ] Update `UsersController.GetById()` - Query Site và populate SiteCode
- [ ] Add helper method `GetSiteByIdAsync()` trong UsersController hoặc inject SiteRepository
- [ ] Test `ApiControllerBase.GetSiteCode()` hoạt động sau khi fix

### Frontend Changes (Optional)

- [ ] Verify frontend có thể đọc SiteCode từ UserDto
- [ ] Consider remove localStorage SiteCode nếu có trong UserDto
- [ ] Update UI để display SiteCode từ response thay vì localStorage

### Testing

- [ ] Test login với SiteCode → Verify JWT có siteCode claim
- [ ] Test login với SiteID → Verify JWT có siteCode claim
- [ ] Test GetCurrentUser → Verify UserDto có SiteCode
- [ ] Test GetUsers → Verify UserDto có SiteCode
- [ ] Test ApiControllerBase.GetSiteCode() → Verify không còn empty

---

## 📝 NOTES

- Có file `REFACTORING-PLAN-SITEID.md` đề xuất chuyển hoàn toàn sang SiteID, nhưng điều này sẽ breaking change lớn
- Option 3 (Hybrid) là compromise tốt nhất: giữ user-friendly nhưng vẫn consistent internally
- Cần thêm SiteRepository hoặc helper method để query Site info hiệu quả

---

**Kết luận:** Có GAP nghiêm trọng giữa SiteID và SiteCode. Cần fix ngay để đảm bảo consistency và functionality.

