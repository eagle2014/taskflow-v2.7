using TaskFlow.API.Models.DTOs.Auth;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Authentication service interface with multi-tenant support
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Authenticates a user and generates JWT tokens
        /// </summary>
        /// <param name="loginDto">Login credentials including SiteCode</param>
        /// <returns>Authentication response with tokens and user data</returns>
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);

        /// <summary>
        /// Registers a new user with multi-tenant support
        /// </summary>
        /// <param name="registerDto">Registration data including SiteCode</param>
        /// <returns>Authentication response with tokens and user data</returns>
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);

        /// <summary>
        /// Refreshes an access token using a refresh token
        /// </summary>
        /// <param name="refreshToken">Refresh token</param>
        /// <returns>New authentication response with refreshed tokens</returns>
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Gets current user data
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="userId">User ID</param>
        /// <returns>User DTO or null if not found</returns>
        Task<UserDto?> GetCurrentUserAsync(string siteId, Guid userId);
    }
}
