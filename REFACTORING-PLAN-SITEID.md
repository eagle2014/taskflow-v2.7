# 📋 Refactoring Plan: SiteCode → SiteID

> **⚠️ NOTE:** Plan này đã được cập nhật và mở rộng.  
> **Xem plan đầy đủ tại:** `docs/REFACTORING_PLAN_SITEID_COMPLETE.md`

## Mục tiêu
Thống nhất sử dụng **SiteID** (GUID) thay vì **SiteCode** (string) trong toàn bộ authentication flow và API calls.

## Lý do
- **Security**: SiteID là GUID không đoán được, SiteCode có thể brute-force
- **Performance**: Lookup by GUID (indexed PK) nhanh hơn string compare
- **Consistency**: Tất cả entities khác đều dùng GUID IDs
- **Simplicity**: Giảm lookup Site by Code trước mỗi API call

---

## 📍 Thay đổi cần thực hiện

### 1. Backend DTOs

#### LoginDto.cs
**TRƯỚC:**
```csharp
public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SiteCode { get; set; } = string.Empty; // ❌ XÓA
}
```

**SAU:**
```csharp
public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid SiteID { get; set; } // ✅ THÊM
}
```

#### RegisterDto.cs
Tương tự - đổi `public string SiteCode` → `public Guid SiteID`

---

### 2. Backend Services

#### AuthService.cs - LoginAsync()

**TRƯỚC:**
```csharp
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // Get site by site code ❌
    var site = await GetSiteBySiteCodeAsync(loginDto.SiteCode);
    if (site == null)
        throw new UnauthorizedAccessException("Invalid site code");

    // Get user by email and site
    var user = await _userRepository.GetByEmailAsync(site.SiteID, loginDto.Email);
    ...
}
```

**SAU:**
```csharp
public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
{
    // Validate SiteID exists ✅
    var site = await GetSiteByIdAsync(loginDto.SiteID);
    if (site == null || !site.IsActive)
        throw new UnauthorizedAccessException("Invalid site");

    // Get user by email and site
    var user = await _userRepository.GetByEmailAsync(loginDto.SiteID, loginDto.Email);
    ...
}
```

#### Thêm method mới:
```csharp
private async Task<Site?> GetSiteByIdAsync(Guid siteId)
{
    var connectionString = _configuration.GetConnectionString("DefaultConnection");
    using var connection = new SqlConnection(connectionString);

    var sql = "SELECT * FROM Sites WHERE SiteID = @SiteID AND IsActive = 1";
    return await connection.QueryFirstOrDefaultAsync<Site>(sql, new { SiteID = siteId });
}
```

#### TokenService.cs - GenerateAccessToken()

**TRƯỚC:**
```csharp
public string GenerateAccessToken(User user, string siteCode)
{
    var claims = new List<Claim>
    {
        new Claim("siteId", user.SiteID.ToString()),
        new Claim("siteCode", siteCode), // ❌ XÓA
        new Claim("userId", user.UserID.ToString()),
        new Claim("role", user.Role)
    };
    ...
}
```

**SAU:**
```csharp
public string GenerateAccessToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim("siteId", user.SiteID.ToString()), // ✅ GIỮ LẠI
        new Claim("userId", user.UserID.ToString()),
        new Claim("role", user.Role)
    };
    ...
}
```

**Cập nhật call sites:**
```csharp
// AuthService.cs
var accessToken = _tokenService.GenerateAccessToken(user); // Remove siteCode param
```

---

### 3. Frontend Changes

#### src/services/api.ts - authApi.login()

**TRƯỚC:**
```typescript
async login(email: string, password: string, siteCode: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
        email,
        password,
        siteCode // ❌ XÓA
    });
    ...
}
```

**SAU:**
```typescript
async login(email: string, password: string, siteId: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
        email,
        password,
        siteId // ✅ THÊM (GUID string)
    });
    ...
}
```

#### src/components/SimpleAuth.tsx

**TRƯỚC:**
```tsx
const [formData, setFormData] = useState({
    email: '',
    password: '',
    siteCode: '' // ❌ XÓA
});

const handleSignIn = async (e: React.FormEvent) => {
    const { user } = await authApi.signIn(
        formData.email,
        formData.password,
        formData.siteCode
    );
    ...
};
```

**SAU:**
```tsx
const [formData, setFormData] = useState({
    email: '',
    password: '',
    siteId: '' // ✅ THÊM
});

const handleSignIn = async (e: React.FormEvent) => {
    const { user } = await authApi.signIn(
        formData.email,
        formData.password,
        formData.siteId // GUID của ACME hoặc TECHSTART
    );
    ...
};
```

#### UI Changes
**Login Form cần input cho SiteID:**
```tsx
<Input
    type="text"
    placeholder="Site ID (GUID)"
    value={formData.siteId}
    onChange={(e) => setFormData({...formData, siteId: e.target.value})}
/>
```

**HOẶC dùng dropdown select:**
```tsx
<Select
    value={formData.siteId}
    onValueChange={(value) => setFormData({...formData, siteId: value})}
>
    <SelectItem value="{ACME_SITE_ID}">ACME Corporation</SelectItem>
    <SelectItem value="{TECHSTART_SITE_ID}">Tech Startup Inc</SelectItem>
</Select>
```

---

### 4. Database Changes

**KHÔNG CẦN** - Database đã có SiteID, chỉ cần thêm index nếu chưa có:

```sql
-- Ensure Sites table has index on SiteID (already has as PK)
-- No changes needed
```

---

## ✅ Checklist Implementation

### Backend
- [ ] Update LoginDto: SiteCode → SiteID
- [ ] Update RegisterDto: SiteCode → SiteID
- [ ] Update AuthService.LoginAsync() - remove GetSiteBySiteCodeAsync()
- [ ] Add AuthService.GetSiteByIdAsync() method
- [ ] Update AuthService.RegisterAsync()
- [ ] Update TokenService.GenerateAccessToken() - remove siteCode parameter
- [ ] Remove unused GetSiteBySiteCodeAsync() method
- [ ] Update all AuthService call sites

### Frontend
- [ ] Update authApi.login() signature
- [ ] Update authApi.register() signature
- [ ] Update SimpleAuth component state
- [ ] Add SiteID input/select to login form
- [ ] Update form submission handlers
- [ ] Update mockApi to return SiteID in responses
- [ ] Add helper to get SiteID from SiteCode for testing

### Testing
- [ ] Test login with SiteID (ACME GUID)
- [ ] Test login with invalid SiteID
- [ ] Test register with SiteID
- [ ] Test token includes correct siteId claim
- [ ] Test multi-tenant isolation still works

---

## 🎯 SiteID Values (From Database)

**Sau khi seed data chạy:**
```sql
SELECT SiteID, SiteName, SiteCode FROM Sites WHERE IsActive = 1;
```

**Sample Output:**
```
SiteID                                  SiteName              SiteCode
--------------------------------------  --------------------  --------
A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6   ACME Corporation      ACME
B2C3D4E5-F6G7-H8I9-J0K1-L2M3N4O5P6Q7   Tech Startup Inc      TECHSTART
```

**Frontend cần hardcode hoặc fetch these GUIDs.**

---

## 🚨 Breaking Changes

**API Contract Changes:**
- `POST /api/auth/login` body: `siteCode` → `siteId`
- `POST /api/auth/register` body: `siteCode` → `siteId`

**Frontend Impact:**
- Tất cả login/register calls phải update
- UI cần cho user nhập/chọn SiteID thay vì SiteCode

---

## 📖 Migration Path

### Option A: Big Bang (Recommended for dev)
1. Update tất cả backend code
2. Update tất cả frontend code
3. Deploy cùng lúc
4. Test end-to-end

### Option B: Backward Compatible (Production)
1. Backend accept cả SiteCode VÀ SiteID
2. Frontend migrate dần
3. Sau khi frontend hoàn toàn chuyển sang SiteID, remove SiteCode support

**Chọn Option A vì đang trong dev phase.**

---

## 📝 Questions to Resolve

1. **UI/UX**: User nhập SiteID (GUID dài) hay chọn từ dropdown?
   - **Suggestion**: Dropdown with SiteName, submit SiteID behind the scenes

2. **Frontend**: Hardcode Site GUIDs hay fetch từ API?
   - **Suggestion**: Tạo `GET /api/sites/public` endpoint trả list sites

3. **Testing**: Làm sao user test nhanh không cần copy-paste GUID?
   - **Suggestion**: Quick login buttons với pre-filled SiteID

---

---

## 📖 PLAN MỚI - ĐẦY ĐỦ VÀ CHI TIẾT

**Plan này đã được mở rộng và cập nhật đầy đủ.**

**Xem plan chi tiết tại:** `docs/REFACTORING_PLAN_SITEID_COMPLETE.md`

**Plan mới bao gồm:**
- ✅ Chi tiết đầy đủ tất cả files cần sửa
- ✅ Code examples cho từng thay đổi
- ✅ New endpoint `/api/sites/public` để frontend lấy sites
- ✅ Frontend changes với dropdown implementation
- ✅ Testing checklist đầy đủ
- ✅ Breaking changes documentation
- ✅ Migration strategy

**Ready to implement?** Review plan đầy đủ tại `docs/REFACTORING_PLAN_SITEID_COMPLETE.md` và approve để bắt đầu refactor!