using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Project repository interface with multi-tenant support
    /// ProjectID is human-readable code (e.g., "PRJ-0001"), RowPointer is internal GUID
    /// </summary>
    public interface IProjectRepository
    {
        /// <summary>
        /// Get all projects for a specific site
        /// </summary>
        Task<IEnumerable<Project>> GetAllAsync(string siteId);

        /// <summary>
        /// Get project by ProjectID (human-readable code)
        /// </summary>
        Task<Project?> GetByIdAsync(string siteId, string projectId);

        /// <summary>
        /// Get project by RowPointer (internal GUID)
        /// </summary>
        Task<Project?> GetByRowPointerAsync(string siteId, Guid rowPointer);

        /// <summary>
        /// Add new project
        /// </summary>
        Task<Project> AddAsync(Project entity);

        /// <summary>
        /// Update existing project
        /// </summary>
        Task<Project> UpdateAsync(string siteId, string projectId, Project entity);

        /// <summary>
        /// Delete project (soft delete)
        /// </summary>
        Task<bool> DeleteAsync(string siteId, string projectId);

        /// <summary>
        /// Get projects by category for a specific site
        /// </summary>
        Task<IEnumerable<Project>> GetByCategoryAsync(string siteId, string categoryId);

        /// <summary>
        /// Get projects by status for a specific site
        /// </summary>
        Task<IEnumerable<Project>> GetByStatusAsync(string siteId, string status);
    }
}