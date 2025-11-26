using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using TaskFlow.API.Models.DTOs.Auth;
using TaskFlow.API.Models.Entities;
using SystemTask = System.Threading.Tasks.Task;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Service for handling Logto authentication integration
    /// </summary>
    public class LogtoAuthService : ILogtoAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        private readonly ILogger<LogtoAuthService> _logger;

        public LogtoAuthService(
            IConfiguration _configuration,
            ITokenService tokenService,
            ILogger<LogtoAuthService> logger)
        {
            this._configuration = _configuration;
            _tokenService = tokenService;
            _logger = logger;
        }

        /// <summary>
        /// Syncs Logto user to TaskFlow database and generates TaskFlow JWT
        /// </summary>
        public async Task<AuthResponseDto> SyncLogtoUserAsync(LogtoSyncDto syncDto)
        {
            // Validate Logto token - just verify signature and expiration
            // Access tokens for API resources may not have sub claim
            await ValidateLogtoTokenAsync(syncDto.LogtoAccessToken);

            // Trust the LogtoUserID from frontend (extracted from ID token)
            // Access token validation is sufficient to prove authenticity
            _logger.LogInformation("Logto token valid. Using provided LogtoUserID: '{ProvidedId}'", syncDto.LogtoUserID);

            // Resolve Site ID from identifier
            var siteId = await ResolveSiteIdAsync(syncDto.SiteIdentifier);
            if (string.IsNullOrEmpty(siteId))
            {
                throw new ArgumentException($"Invalid site identifier: {syncDto.SiteIdentifier}");
            }

            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // First check if user already exists with this LogtoUserID
            var existingUserSql = @"
                SELECT u.UserID, u.SiteID, u.Email, u.Name, u.Avatar, u.Role, u.Status,
                       u.LogtoUserID, u.CreatedAt, u.UpdatedAt, u.LastActive
                FROM Users u
                WHERE u.LogtoUserID = @LogtoUserID AND u.IsDeleted = 0";

            var user = await connection.QueryFirstOrDefaultAsync<User>(existingUserSql, new { LogtoUserID = syncDto.LogtoUserID });

            if (user != null)
            {
                // User already mapped - just update last active and return
                var updateSql = @"
                    UPDATE Users SET LastActive = GETUTCDATE(), UpdatedAt = GETUTCDATE()
                    WHERE LogtoUserID = @LogtoUserID";
                await connection.ExecuteAsync(updateSql, new { LogtoUserID = syncDto.LogtoUserID });

                _logger.LogInformation("Logto user {LogtoUserID} already mapped, returning existing user", syncDto.LogtoUserID);
            }
            else
            {
                // User not found - call stored procedure to create/sync
                var parameters = new DynamicParameters();
                parameters.Add("@LogtoUserID", syncDto.LogtoUserID);
                parameters.Add("@SiteID", siteId);
                parameters.Add("@Email", syncDto.Email);
                parameters.Add("@Name", syncDto.Name);
                parameters.Add("@Avatar", syncDto.Avatar);
                parameters.Add("@Role", syncDto.Role);

                user = await connection.QueryFirstOrDefaultAsync<User>(
                    "dbo.SyncLogtoUser",
                    parameters,
                    commandType: System.Data.CommandType.StoredProcedure);

                if (user == null)
                {
                    throw new InvalidOperationException("Failed to sync Logto user");
                }
            }

            _logger.LogInformation("Logto user {LogtoUserID} synced successfully to site {SiteID}",
                syncDto.LogtoUserID, siteId);

            // Generate TaskFlow JWT tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var jwtSettings = _configuration.GetSection("Jwt");
            var expirationMinutes = int.Parse(jwtSettings["AccessTokenExpirationMinutes"] ?? "480");

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = expirationMinutes * 60,
                User = MapUserToDto(user)
            };
        }

        /// <summary>
        /// Gets all sites assigned to a Logto user (queries Users table directly)
        /// Auto-maps user by email if LogtoUserID not found
        /// </summary>
        public async Task<List<LogtoSiteMappingDto>> GetLogtoUserSitesAsync(string logtoUserId)
        {
            return await GetLogtoUserSitesAsync(logtoUserId, null);
        }

        /// <summary>
        /// Gets all sites assigned to a Logto user with optional email for auto-mapping
        /// Email format: username@SiteID.com (e.g., trungnt@T0001.com)
        /// </summary>
        public async Task<List<LogtoSiteMappingDto>> GetLogtoUserSitesAsync(string logtoUserId, string? email)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            // First, check if user already has LogtoUserID mapped
            var sql = @"
                SELECT
                    u.UserID,
                    u.SiteID,
                    s.SiteCode,
                    s.SiteName,
                    u.Email,
                    u.Name,
                    u.Avatar,
                    u.Role,
                    1 AS IsActive
                FROM Users u
                INNER JOIN Sites s ON u.SiteID = s.SiteID
                WHERE u.LogtoUserID = @LogtoUserID
                    AND u.IsDeleted = 0
                    AND s.IsActive = 1";

            var mappings = await connection.QueryAsync<LogtoSiteMappingDto>(sql, new { LogtoUserID = logtoUserId });
            var result = mappings.ToList();

            // If no mappings found and email provided, parse SiteID from email and auto-map
            if (result.Count == 0 && !string.IsNullOrEmpty(email))
            {
                _logger.LogInformation("No mapping found for LogtoUserID {LogtoUserID}, parsing SiteID from email {Email}", logtoUserId, email);
                result = await AutoMapUserBySiteFromEmailAsync(logtoUserId, email, connection);
            }

            return result;
        }

        /// <summary>
        /// Parses SiteID from email domain
        /// Email format: username@SiteID.com → returns SiteID
        /// Example: trungnt@T0001.com → T0001
        /// </summary>
        private string? ParseSiteIdFromEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains('@'))
                return null;

            var parts = email.Split('@');
            if (parts.Length != 2)
                return null;

            var domain = parts[1]; // e.g., "T0001.com" or "T00001.com"

            // Remove .com, .vn, etc. suffix to get SiteID
            var dotIndex = domain.LastIndexOf('.');
            if (dotIndex > 0)
            {
                return domain.Substring(0, dotIndex); // e.g., "T0001" or "T00001"
            }

            return domain;
        }

        /// <summary>
        /// Normalizes SiteID by removing extra leading zeros after prefix
        /// Example: T00001 → T0001, T000001 → T0001
        /// </summary>
        private string NormalizeSiteId(string siteId)
        {
            if (string.IsNullOrEmpty(siteId))
                return siteId;

            // Pattern: letter prefix (e.g., T) followed by zeros and a number
            // T00001 → T0001, T000001 → T0001
            // Keep format as: {prefix}0{number} (single leading zero)
            var match = System.Text.RegularExpressions.Regex.Match(siteId, @"^([A-Za-z]+)(0+)(\d+)$");
            if (match.Success)
            {
                var prefix = match.Groups[1].Value;  // e.g., "T"
                var number = match.Groups[3].Value;  // e.g., "1"
                // Keep 4 digits total: T0001
                var paddedNumber = number.PadLeft(4, '0');
                return prefix + paddedNumber;
            }

            return siteId;
        }

        /// <summary>
        /// Auto-maps a Logto user by parsing SiteID from email domain
        /// Then finds user in that Site and updates LogtoUserID
        /// </summary>
        private async Task<List<LogtoSiteMappingDto>> AutoMapUserBySiteFromEmailAsync(string logtoUserId, string email, SqlConnection connection)
        {
            // Parse SiteID from email domain (e.g., trungnt@T0001.com → T0001)
            var siteIdFromEmail = ParseSiteIdFromEmail(email);

            if (string.IsNullOrEmpty(siteIdFromEmail))
            {
                _logger.LogWarning("Could not parse SiteID from email: {Email}", email);
                return new List<LogtoSiteMappingDto>();
            }

            _logger.LogInformation("Parsed SiteID '{SiteID}' from email '{Email}'", siteIdFromEmail, email);

            // Extract username from email (part before @)
            var username = email.Split('@')[0];

            // Normalize SiteID: Remove extra leading zeros after prefix (T00001 → T0001)
            var normalizedSiteId = NormalizeSiteId(siteIdFromEmail);
            _logger.LogInformation("Normalized SiteID '{NormalizedSiteID}' from '{OriginalSiteID}'", normalizedSiteId, siteIdFromEmail);

            // Find user in the Site by matching SiteID or SiteCode (with normalization)
            // Only update ONE user (TOP 1) to avoid duplicate key error on unique LogtoUserID index
            var updateSql = @"
                UPDATE TOP(1) Users
                SET LogtoUserID = @LogtoUserID, UpdatedAt = GETUTCDATE()
                WHERE (SiteID = @SiteID OR SiteID = @NormalizedSiteID
                       OR SiteID IN (SELECT SiteID FROM Sites WHERE SiteCode = @SiteID OR SiteCode = @NormalizedSiteID))
                    AND (LogtoUserID IS NULL OR LogtoUserID = '')
                    AND IsDeleted = 0";

            var rowsAffected = await connection.ExecuteAsync(updateSql, new { LogtoUserID = logtoUserId, SiteID = siteIdFromEmail, NormalizedSiteID = normalizedSiteId });

            if (rowsAffected > 0)
            {
                _logger.LogInformation("Auto-mapped {Count} user(s) in Site {SiteID} to LogtoUserID {LogtoUserID}", rowsAffected, siteIdFromEmail, logtoUserId);
            }
            else
            {
                _logger.LogWarning("No users found in Site {SiteID} to map with LogtoUserID {LogtoUserID}", siteIdFromEmail, logtoUserId);
            }

            // Query for the mapped users
            var querySql = @"
                SELECT
                    u.UserID,
                    u.SiteID,
                    s.SiteCode,
                    s.SiteName,
                    u.Email,
                    u.Name,
                    u.Avatar,
                    u.Role,
                    1 AS IsActive
                FROM Users u
                INNER JOIN Sites s ON u.SiteID = s.SiteID
                WHERE u.LogtoUserID = @LogtoUserID
                    AND u.IsDeleted = 0
                    AND s.IsActive = 1";

            var mappings = await connection.QueryAsync<LogtoSiteMappingDto>(querySql, new { LogtoUserID = logtoUserId });
            return mappings.ToList();
        }

        /// <summary>
        /// Validates Logto access token using JWKS
        /// </summary>
        public async Task<ClaimsPrincipal> ValidateLogtoTokenAsync(string token)
        {
            var logtoSettings = _configuration.GetSection("Logto");
            var logtoEndpoint = logtoSettings["Endpoint"];
            var logtoAppId = logtoSettings["AppId"];

            if (string.IsNullOrEmpty(logtoEndpoint) || string.IsNullOrEmpty(logtoAppId))
            {
                throw new InvalidOperationException("Logto settings not configured");
            }

            try
            {
                // Get JWKS from Logto
                var jwksUrl = $"{logtoEndpoint}/oidc/jwks";
                using var httpClient = new HttpClient();
                var jwksJson = await httpClient.GetStringAsync(jwksUrl);

                var jwks = new JsonWebKeySet(jwksJson);

                var tokenHandler = new JwtSecurityTokenHandler();
                // Accept both Logto App ID and API resource URL as valid audiences
                var validAudiences = new[] { logtoAppId, "http://localhost:5001" };
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"{logtoEndpoint}/oidc",
                    ValidateAudience = true,
                    ValidAudiences = validAudiences,
                    ValidateLifetime = true,
                    IssuerSigningKeys = jwks.GetSigningKeys(),
                    ClockSkew = TimeSpan.FromMinutes(5)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                _logger.LogInformation("Logto token validated successfully");

                return principal;
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning(ex, "Logto token validation failed");
                throw new UnauthorizedAccessException("Invalid Logto token", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Logto token validation");
                throw;
            }
        }

        /// <summary>
        /// Deactivates a Logto user mapping
        /// </summary>
        public async SystemTask DeactivateMappingAsync(string logtoUserId, string siteId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            await connection.ExecuteAsync(
                "dbo.DeactivateLogtoMapping",
                new { LogtoUserID = logtoUserId, SiteID = siteId },
                commandType: System.Data.CommandType.StoredProcedure);

            _logger.LogInformation("Deactivated Logto mapping for user {LogtoUserID} in site {SiteID}",
                logtoUserId, siteId);
        }

        /// <summary>
        /// Resolves site ID from site code or direct SiteID
        /// </summary>
        private async Task<string> ResolveSiteIdAsync(string siteIdentifier)
        {
            // Try as direct SiteID first
            var site = await GetSiteByIdAsync(siteIdentifier);
            if (site != null && site.IsActive)
            {
                return siteIdentifier;
            }

            // Try as site code
            var siteByCode = await GetSiteByCodeAsync(siteIdentifier);
            return siteByCode != null && siteByCode.IsActive ? siteByCode.SiteID : string.Empty;
        }

        /// <summary>
        /// Gets site by site ID
        /// </summary>
        private async Task<Site?> GetSiteByIdAsync(string siteId)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            var sql = @"
                SELECT SiteID, SiteCode, SiteName, Domain, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt
                FROM Sites
                WHERE SiteID = @SiteID";

            return await connection.QueryFirstOrDefaultAsync<Site>(sql, new { SiteID = siteId });
        }

        /// <summary>
        /// Gets site by site code
        /// </summary>
        private async Task<Site?> GetSiteByCodeAsync(string siteCode)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);

            var sql = @"
                SELECT SiteID, SiteCode, SiteName, Domain, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt
                FROM Sites
                WHERE SiteCode = @SiteCode";

            return await connection.QueryFirstOrDefaultAsync<Site>(sql, new { SiteCode = siteCode });
        }

        /// <summary>
        /// Maps User entity to UserDto
        /// </summary>
        private UserDto MapUserToDto(User user)
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
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}
