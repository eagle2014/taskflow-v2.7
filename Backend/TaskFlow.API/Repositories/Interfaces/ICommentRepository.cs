using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Comment repository interface with multi-tenant support
    /// </summary>
    public interface ICommentRepository : IRepository<Comment>
    {
        /// <summary>
        /// Get comments by task for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="taskId">Task ID</param>
        /// <returns>Collection of comments</returns>
        Task<IEnumerable<Comment>> GetByTaskAsync(string siteId, Guid taskId);

        /// <summary>
        /// Get comments by user for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="userId">User ID</param>
        /// <returns>Collection of comments</returns>
        Task<IEnumerable<Comment>> GetByUserAsync(string siteId, Guid userId);
    }
}
