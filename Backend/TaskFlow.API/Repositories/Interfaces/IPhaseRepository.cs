using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Phase repository interface with multi-tenant support
    /// </summary>
    public interface IPhaseRepository : IRepository<Phase>
    {
        /// <summary>
        /// Get phases by project for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="projectId">Project ID</param>
        /// <returns>Collection of phases ordered by Order field</returns>
        Task<IEnumerable<Phase>> GetByProjectAsync(string siteId, Guid projectId);

        /// <summary>
        /// Reorder phases within a project
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="projectId">Project ID</param>
        /// <param name="phaseIds">List of phase IDs in new order</param>
        /// <returns>True if reordered successfully</returns>
        Task<bool> ReorderAsync(string siteId, Guid projectId, List<Guid> phaseIds);
    }
}
