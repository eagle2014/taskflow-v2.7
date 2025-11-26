using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.Models.DTOs.Common;

namespace TaskFlow.API.Controllers.Base
{
    /// <summary>
    /// Base controller for API endpoints with multi-tenant support
    /// Provides helper methods for extracting user context from JWT claims
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public abstract class ApiControllerBase : ControllerBase
    {
        /// <summary>
        /// Extracts SiteID from JWT claims
        /// Throws UnauthorizedAccessException if claim is missing
        /// </summary>
        /// <returns>Site ID for multi-tenant filtering</returns>
        protected string GetSiteId()
        {
            var siteId = User.FindFirst("siteId")?.Value;

            if (string.IsNullOrEmpty(siteId))
            {
                throw new UnauthorizedAccessException("SiteID claim not found in token");
            }

            return siteId;
        }

        /// <summary>
        /// Extracts UserID from JWT claims
        /// Throws UnauthorizedAccessException if claim is missing or invalid
        /// </summary>
        /// <returns>Current user ID</returns>
        protected Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("UserID claim not found in token");
            }

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid UserID format in token");
            }

            return userId;
        }

        /// <summary>
        /// Extracts user role from JWT claims
        /// </summary>
        /// <returns>User role or empty string if not found</returns>
        protected string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }

        /// <summary>
        /// Extracts user email from JWT claims
        /// </summary>
        /// <returns>User email or empty string if not found</returns>
        protected string GetUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        }

        /// <summary>
        /// Extracts site code from JWT claims
        /// </summary>
        /// <returns>Site code or empty string if not found</returns>
        protected string GetSiteCode()
        {
            return User.FindFirst("siteCode")?.Value ?? string.Empty;
        }

        /// <summary>
        /// Helper method to create a success response
        /// </summary>
        protected ActionResult<ApiResponse<T>> Success<T>(T data, string message = "Success")
        {
            return Ok(ApiResponse<T>.SuccessResponse(data, message));
        }

        /// <summary>
        /// Helper method to create an error response
        /// </summary>
        protected ActionResult<ApiResponse<T>> Error<T>(string error, string? message = null, int statusCode = 400)
        {
            return StatusCode(statusCode, ApiResponse<T>.ErrorResponse(error, message));
        }

        /// <summary>
        /// Helper method to create a not found response
        /// </summary>
        protected ActionResult<ApiResponse<T>> NotFound<T>(string message = "Resource not found")
        {
            return NotFound(ApiResponse<T>.ErrorResponse(message));
        }
    }
}
