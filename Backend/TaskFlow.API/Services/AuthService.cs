using BCrypt.Net;
using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs.Auth;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Authentication service with BCrypt password hashing and JWT token generation
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IConfiguration configuration,
            ITokenService tokenService,
            IUserRepository userRepository,
            ILogger<AuthService> logger)
        {
            _configuration = configuration;
            _tokenService = tokenService;
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <summary>
        /// Authenticates a user with multi-tenant support
        /// </summary>
        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Resolve SiteID from SiteCode if needed
            string siteId;
            if (!string.IsNullOrEmpty(loginDto.SiteID))
            {
                siteId = loginDto.SiteID;
            }
            else if (!string.IsNullOrEmpty(loginDto.SiteCode))
            {
                var site = await GetSiteByCodeAsync(loginDto.SiteCode);
                if (site == null)
                {
                    _logger.LogWarning("Login attempt with invalid site code: {SiteCode}", loginDto.SiteCode);
                    throw new UnauthorizedAccessException("Invalid site code");
                }
                siteId = site.SiteID;
            }
            else
            {
                throw new UnauthorizedAccessException("Site ID or Site Code is required");
            }

            // Validate site exists and is active
            var siteEntity = await GetSiteByIdAsync(siteId);
            if (siteEntity == null || !siteEntity.IsActive)
            {
                _logger.LogWarning("Login attempt with invalid site ID: {SiteID}", siteId);
                throw new UnauthorizedAccessException("Invalid site");
            }

            // Get user by email and site
            var user = await _userRepository.GetByEmailAsync(siteId, loginDto.Email);
            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent email: {Email} at site {SiteID}", loginDto.Email, siteId);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Verify password using BCrypt
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
            await _userRepository.UpdateLastActiveAsync(siteId, user.UserID);

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var jwtSettings = _configuration.GetSection("Jwt");
            var expirationMinutes = int.Parse(jwtSettings["AccessTokenExpirationMinutes"] ?? "480");

            _logger.LogInformation("User {UserId} logged in successfully at site {SiteID}", user.UserID, siteId);

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = expirationMinutes * 60, // Convert to seconds
                User = MapUserToDto(user)
            };
        }

        /// <summary>
        /// Registers a new user with multi-tenant support
        /// </summary>
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Validate site exists and is active
            var site = await GetSiteByIdAsync(registerDto.SiteID);
            if (site == null || !site.IsActive)
            {
                _logger.LogWarning("Registration attempt with invalid site ID: {SiteID}", registerDto.SiteID);
                throw new InvalidOperationException("Invalid site");
            }

            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(registerDto.SiteID, registerDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration attempt with existing email: {Email}", registerDto.Email);
                throw new InvalidOperationException("User with this email already exists");
            }

            // Hash password using BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            // Create new user
            var newUser = new User
            {
                UserID = Guid.NewGuid(),
                SiteID = registerDto.SiteID,
                Name = registerDto.Name,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Role = registerDto.Role,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            var createdUser = await _userRepository.AddAsync(newUser);

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(createdUser);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var jwtSettings = _configuration.GetSection("Jwt");
            var expirationMinutes = int.Parse(jwtSettings["AccessTokenExpirationMinutes"] ?? "480");

            _logger.LogInformation("New user {UserId} registered successfully at site {SiteID}", createdUser.UserID, registerDto.SiteID);

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = expirationMinutes * 60,
                User = MapUserToDto(createdUser)
            };
        }

        /// <summary>
        /// Refreshes access token using refresh token
        /// Note: This is a simplified implementation. In production, store refresh tokens in database.
        /// </summary>
        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            // Validate refresh token format
            if (!_tokenService.ValidateRefreshToken(refreshToken))
            {
                throw new UnauthorizedAccessException("Invalid refresh token");
            }

            // TODO: In production, retrieve user from stored refresh token in database
            // For now, throw exception as refresh token storage is not implemented
            throw new NotImplementedException("Refresh token storage not implemented. Please login again.");
        }

        /// <summary>
        /// Gets current user data
        /// </summary>
        public async Task<UserDto?> GetCurrentUserAsync(string siteId, Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(siteId, userId);
            return user != null ? MapUserToDto(user) : null;
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
