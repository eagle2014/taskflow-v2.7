using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Project category repository interface with multi-tenant support
    /// </summary>
    public interface ICategoryRepository : IRepository<ProjectCategory>
    {
        /// <summary>
        /// Get category by name for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="name">Category name</param>
        /// <returns>Category or null if not found</returns>
        Task<ProjectCategory?> GetByNameAsync(string siteId, string name);
    }
}
