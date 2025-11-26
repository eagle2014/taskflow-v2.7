using System.Security.Claims;
using TaskFlow.API.Models.DTOs.Auth;
using SystemTask = System.Threading.Tasks.Task;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Logto authentication service interface
    /// </summary>
    public interface ILogtoAuthService
    {
        /// <summary>
        /// Syncs Logto user to TaskFlow database and generates TaskFlow JWT tokens
        /// </summary>
        /// <param name="syncDto">Logto user sync data</param>
        /// <returns>TaskFlow authentication response with tokens</returns>
        Task<AuthResponseDto> SyncLogtoUserAsync(LogtoSyncDto syncDto);

        /// <summary>
        /// Gets all sites assigned to a Logto user
        /// </summary>
        /// <param name="logtoUserId">Logto user ID</param>
        /// <returns>List of site mappings</returns>
        Task<List<LogtoSiteMappingDto>> GetLogtoUserSitesAsync(string logtoUserId);

        /// <summary>
        /// Gets all sites assigned to a Logto user with optional email for auto-mapping
        /// </summary>
        /// <param name="logtoUserId">Logto user ID</param>
        /// <param name="email">Optional email to auto-map user</param>
        /// <returns>List of site mappings</returns>
        Task<List<LogtoSiteMappingDto>> GetLogtoUserSitesAsync(string logtoUserId, string? email);

        /// <summary>
        /// Validates Logto access token and extracts claims
        /// </summary>
        /// <param name="token">Logto access token</param>
        /// <returns>Claims principal from validated token</returns>
        Task<ClaimsPrincipal> ValidateLogtoTokenAsync(string token);

        /// <summary>
        /// Deactivates a Logto user mapping (soft delete)
        /// </summary>
        /// <param name="logtoUserId">Logto user ID</param>
        /// <param name="siteId">Site ID</param>
        SystemTask DeactivateMappingAsync(string logtoUserId, string siteId);
    }
}
