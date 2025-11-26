using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// User repository interface with multi-tenant support
    /// </summary>
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>
        /// Get user by email for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="email">User email</param>
        /// <returns>User or null if not found</returns>
        Task<User?> GetByEmailAsync(string siteId, string email);

        /// <summary>
        /// Get users by role for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="role">User role</param>
        /// <returns>Collection of users</returns>
        Task<IEnumerable<User>> GetByRoleAsync(string siteId, string role);

        /// <summary>
        /// Get users by status for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="status">User status</param>
        /// <returns>Collection of users</returns>
        Task<IEnumerable<User>> GetByStatusAsync(string siteId, string status);

        /// <summary>
        /// Update user's last active timestamp
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="userId">User ID</param>
        /// <returns>True if updated successfully</returns>
        Task<bool> UpdateLastActiveAsync(string siteId, Guid userId);
    }
}
