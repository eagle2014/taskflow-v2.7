using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Auth;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Users management endpoints with multi-tenant support
    /// </summary>
    public class UsersController : ApiControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserRepository userRepository,
            ILogger<UsersController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all users for current tenant
        /// </summary>
        /// <returns>List of users</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var users = await _userRepository.GetAllAsync(siteId);

                var userDtos = users.Select(u => new UserDto
                {
                    UserID = u.UserID,
                    SiteID = u.SiteID,
                    Email = u.Email,
                    Name = u.Name,
                    Avatar = u.Avatar,
                    Role = u.Role,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    LastActive = u.LastActive,
                    SiteCode = string.Empty, // Will be populated from Site if needed
                    SiteName = string.Empty
                });

                return Success(userDtos, "Users retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResponse("Error retrieving users"));
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var user = await _userRepository.GetByIdAsync(siteId, id);

                if (user == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));
                }

                var userDto = new UserDto
                {
                    UserID = user.UserID,
                    SiteID = user.SiteID,
                    Email = user.Email,
                    Name = user.Name,
                    Avatar = user.Avatar,
                    Role = user.Role,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt,
                    LastActive = user.LastActive,
                    SiteCode = string.Empty,
                    SiteName = string.Empty
                };

                return Success(userDto, "User retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, ApiResponse<UserDto>.ErrorResponse("Error retrieving user"));
            }
        }

        /// <summary>
        /// Update user profile
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="updateDto">User update data</param>
        /// <returns>Updated user</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> Update(Guid id, [FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var currentUserId = GetUserId();

                // Users can only update their own profile unless they are Admin
                var currentUserRole = GetUserRole();
                if (id != currentUserId && currentUserRole != "Admin")
                {
                    return Forbid();
                }

                var existingUser = await _userRepository.GetByIdAsync(siteId, id);

                if (existingUser == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingUser.Name = updateDto.Name;

                if (updateDto.Avatar != null)
                    existingUser.Avatar = updateDto.Avatar;

                if (!string.IsNullOrEmpty(updateDto.Status))
                    existingUser.Status = updateDto.Status;

                // Only admins can change roles
                if (!string.IsNullOrEmpty(updateDto.Role) && currentUserRole == "Admin")
                    existingUser.Role = updateDto.Role;

                existingUser.UpdatedAt = DateTime.UtcNow;

                var updatedUser = await _userRepository.UpdateAsync(siteId, id, existingUser);

                var userDto = new UserDto
                {
                    UserID = updatedUser.UserID,
                    SiteID = updatedUser.SiteID,
                    Email = updatedUser.Email,
                    Name = updatedUser.Name,
                    Avatar = updatedUser.Avatar,
                    Role = updatedUser.Role,
                    Status = updatedUser.Status,
                    CreatedAt = updatedUser.CreatedAt,
                    LastActive = updatedUser.LastActive,
                    SiteCode = string.Empty,
                    SiteName = string.Empty
                };

                return Success(userDto, "User updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, ApiResponse<UserDto>.ErrorResponse("Error updating user"));
            }
        }

        /// <summary>
        /// Delete user (soft delete) - Admin only
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var currentUserId = GetUserId();

                // Prevent self-deletion
                if (id == currentUserId)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Cannot delete your own account"));
                }

                var user = await _userRepository.GetByIdAsync(siteId, id);

                if (user == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("User not found"));
                }

                await _userRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "User deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting user"));
            }
        }

        /// <summary>
        /// Get users by role
        /// </summary>
        /// <param name="role">User role</param>
        /// <returns>List of users with specified role</returns>
        [HttpGet("role/{role}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetByRole(string role)
        {
            try
            {
                var siteId = GetSiteId();
                var users = await _userRepository.GetByRoleAsync(siteId, role);

                var userDtos = users.Select(u => new UserDto
                {
                    UserID = u.UserID,
                    SiteID = u.SiteID,
                    Email = u.Email,
                    Name = u.Name,
                    Avatar = u.Avatar,
                    Role = u.Role,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    LastActive = u.LastActive,
                    SiteCode = string.Empty,
                    SiteName = string.Empty
                });

                return Success(userDtos, "Users retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users with role {Role}", role);
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResponse("Error retrieving users"));
            }
        }

        /// <summary>
        /// Get users by status
        /// </summary>
        /// <param name="status">User status</param>
        /// <returns>List of users with specified status</returns>
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetByStatus(string status)
        {
            try
            {
                var siteId = GetSiteId();
                var users = await _userRepository.GetByStatusAsync(siteId, status);

                var userDtos = users.Select(u => new UserDto
                {
                    UserID = u.UserID,
                    SiteID = u.SiteID,
                    Email = u.Email,
                    Name = u.Name,
                    Avatar = u.Avatar,
                    Role = u.Role,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    LastActive = u.LastActive,
                    SiteCode = string.Empty,
                    SiteName = string.Empty
                });

                return Success(userDtos, "Users retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users with status {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResponse("Error retrieving users"));
            }
        }

        /// <summary>
        /// Update user last active timestamp
        /// </summary>
        /// <returns>Success response</returns>
        [HttpPost("update-activity")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateActivity()
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                await _userRepository.UpdateLastActiveAsync(siteId, userId);

                return Success<object>(null, "Activity updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user activity");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error updating activity"));
            }
        }
    }
}
