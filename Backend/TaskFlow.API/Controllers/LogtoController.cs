using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Models.DTOs.Auth;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/auth/logto")]
    public class LogtoController : ControllerBase
    {
        private readonly ILogtoAuthService _logtoAuthService;
        private readonly ILogger<LogtoController> _logger;

        public LogtoController(
            ILogtoAuthService logtoAuthService,
            ILogger<LogtoController> logger)
        {
            _logtoAuthService = logtoAuthService;
            _logger = logger;
        }

        /// <summary>
        /// Sync Logto user to TaskFlow database and return TaskFlow JWT token
        /// </summary>
        /// <param name="syncDto">Logto user sync data</param>
        /// <returns>TaskFlow authentication response</returns>
        [HttpPost("sync")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> SyncLogtoUser([FromBody] LogtoSyncDto syncDto)
        {
            try
            {
                _logger.LogInformation("Syncing Logto user {LogtoUserID} to site {SiteIdentifier}",
                    syncDto.LogtoUserID, syncDto.SiteIdentifier);

                var result = await _logtoAuthService.SyncLogtoUserAsync(syncDto);

                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(
                    result,
                    "Logto user synced successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Logto token validation failed for user {LogtoUserID}",
                    syncDto.LogtoUserID);
                return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(
                    "Invalid Logto token"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid site identifier: {SiteIdentifier}",
                    syncDto.SiteIdentifier);
                return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(
                    $"Invalid site identifier: {ex.Message}"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing Logto user {LogtoUserID}",
                    syncDto.LogtoUserID);
                return StatusCode(500, ApiResponse<AuthResponseDto>.ErrorResponse(
                    "An error occurred while syncing Logto user"));
            }
        }

        /// <summary>
        /// Get all sites assigned to a Logto user
        /// If email is provided, will auto-map user by email if not already mapped
        /// </summary>
        /// <param name="logtoUserId">Logto user ID</param>
        /// <param name="email">Optional email for auto-mapping</param>
        /// <returns>List of site mappings for the user</returns>
        [HttpGet("sites/{logtoUserId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<List<LogtoSiteMappingDto>>>> GetLogtoUserSites(
            string logtoUserId,
            [FromQuery] string? email = null)
        {
            try
            {
                _logger.LogInformation("Fetching sites for Logto user {LogtoUserID}, email: {Email}", logtoUserId, email ?? "not provided");

                var sites = await _logtoAuthService.GetLogtoUserSitesAsync(logtoUserId, email);

                return Ok(ApiResponse<List<LogtoSiteMappingDto>>.SuccessResponse(
                    sites,
                    $"Found {sites.Count} site(s) for user"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sites for Logto user {LogtoUserID}", logtoUserId);
                return StatusCode(500, ApiResponse<List<LogtoSiteMappingDto>>.ErrorResponse(
                    "An error occurred while fetching user sites"));
            }
        }

        /// <summary>
        /// Validate Logto token (for testing purposes)
        /// </summary>
        /// <param name="token">Logto access token</param>
        /// <returns>Token validation result</returns>
        [HttpPost("validate-token")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<object>>> ValidateToken([FromBody] string token)
        {
            try
            {
                var claims = await _logtoAuthService.ValidateLogtoTokenAsync(token);

                return Ok(ApiResponse<object>.SuccessResponse(
                    new { Claims = claims },
                    "Token is valid"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Token validation failed");
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid or expired token"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Logto token");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred during token validation"));
            }
        }

        /// <summary>
        /// Deactivate a Logto user mapping (soft delete)
        /// </summary>
        /// <param name="logtoUserId">Logto user ID</param>
        /// <param name="siteId">Site ID to deactivate</param>
        /// <returns>Success response</returns>
        [HttpDelete("sites/{logtoUserId}/{siteId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> DeactivateMapping(
            string logtoUserId,
            string siteId)
        {
            try
            {
                _logger.LogInformation("Deactivating mapping for Logto user {LogtoUserID} in site {SiteID}",
                    logtoUserId, siteId);

                await _logtoAuthService.DeactivateMappingAsync(logtoUserId, siteId);

                return Ok(ApiResponse<object>.SuccessResponse(
                    null,
                    "Mapping deactivated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating mapping for Logto user {LogtoUserID}",
                    logtoUserId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while deactivating mapping"));
            }
        }
    }
}
