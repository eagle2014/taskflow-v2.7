using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Project category repository interface with multi-tenant support
    /// </summary>
    public interface ICategoryRepository
    {
        /// <summary>
        /// Get all categories for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <returns>Collection of categories</returns>
        Task<IEnumerable<ProjectCategory>> GetAllAsync(string siteId);

        /// <summary>
        /// Get category by ID
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="id">Category ID</param>
        /// <returns>Category or null if not found</returns>
        Task<ProjectCategory?> GetByIdAsync(string siteId, string id);

        /// <summary>
        /// Add new category
        /// </summary>
        /// <param name="entity">Category to add</param>
        /// <returns>Created category</returns>
        Task<ProjectCategory> AddAsync(ProjectCategory entity);

        /// <summary>
        /// Update existing category
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="id">Category ID</param>
        /// <param name="entity">Updated category data</param>
        /// <returns>Updated category</returns>
        Task<ProjectCategory> UpdateAsync(string siteId, string id, ProjectCategory entity);

        /// <summary>
        /// Delete category (soft delete)
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="id">Category ID</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteAsync(string siteId, string id);

        /// <summary>
        /// Get category by name for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="name">Category name</param>
        /// <returns>Category or null if not found</returns>
        Task<ProjectCategory?> GetByNameAsync(string siteId, string name);
    }
}
