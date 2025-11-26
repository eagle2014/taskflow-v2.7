using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TaskFlow.API.Models.DTOs.Auth;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("auth")] // Strict rate limiting for auth endpoints (10 req/min)
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// User login with multi-tenant support
        /// </summary>
        /// <param name="loginDto">Login credentials including SiteID</param>
        /// <returns>Authentication response with JWT tokens</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Login failed for {Email} at site {SiteID}", loginDto.Email, loginDto.SiteID);
                return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse("Invalid credentials"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", loginDto.Email);
                return StatusCode(500, ApiResponse<AuthResponseDto>.ErrorResponse("An error occurred during login"));
            }
        }

        /// <summary>
        /// Register new user with multi-tenant support
        /// </summary>
        /// <param name="registerDto">Registration data including SiteID</param>
        /// <returns>Authentication response with JWT tokens</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Registration successful"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed for {Email}", registerDto.Email);
                return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for {Email}", registerDto.Email);
                return StatusCode(500, ApiResponse<AuthResponseDto>.ErrorResponse("An error occurred during registration"));
            }
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        /// <param name="refreshDto">Refresh token request</param>
        /// <returns>New authentication response with refreshed tokens</returns>
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenDto refreshDto)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(refreshDto.RefreshToken);
                return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Token refreshed successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Token refresh failed");
                return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse("Invalid or expired refresh token"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, ApiResponse<AuthResponseDto>.ErrorResponse("An error occurred during token refresh"));
            }
        }

        /// <summary>
        /// Get current authenticated user information
        /// </summary>
        /// <returns>Current user data</returns>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var siteIdClaim = User.FindFirst("siteId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(siteIdClaim))
                {
                    return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid authentication token"));
                }

                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid authentication token"));
                }

                var userDto = await _authService.GetCurrentUserAsync(siteIdClaim, userId);

                if (userDto == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));
                }

                return Ok(ApiResponse<UserDto>.SuccessResponse(userDto, "User retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResponse("An error occurred while retrieving user data"));
            }
        }

        /// <summary>
        /// Logout user (invalidate refresh token on client side)
        /// </summary>
        /// <returns>Success response</returns>
        [HttpPost("logout")]
        [Authorize]
        public ActionResult<ApiResponse<object>> Logout()
        {
            // In a stateless JWT system, logout is handled client-side by removing tokens
            // If we implement token blacklisting in the future, it would be done here
            _logger.LogInformation("User logged out");
            return Ok(ApiResponse<object>.SuccessResponse(null, "Logged out successfully"));
        }

        /// <summary>
        /// Validate if current token is still valid
        /// </summary>
        /// <returns>Token validation status</returns>
        [HttpGet("validate")]
        [Authorize]
        public ActionResult<ApiResponse<object>> ValidateToken()
        {
            return Ok(ApiResponse<object>.SuccessResponse(
                new { valid = true },
                "Token is valid"
            ));
        }
    }
}
