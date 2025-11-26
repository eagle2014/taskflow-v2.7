using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Project repository interface with multi-tenant support
    /// </summary>
    public interface IProjectRepository : IRepository<Project>
    {
        /// <summary>
        /// Get projects by category for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="categoryId">Category ID</param>
        /// <returns>Collection of projects</returns>
        Task<IEnumerable<Project>> GetByCategoryAsync(string siteId, Guid categoryId);

        /// <summary>
        /// Get projects by status for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="status">Project status</param>
        /// <returns>Collection of projects</returns>
        Task<IEnumerable<Project>> GetByStatusAsync(string siteId, string status);
    }
}
