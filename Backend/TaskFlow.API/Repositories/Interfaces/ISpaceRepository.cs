using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Space repository interface with multi-tenant support
    /// </summary>
    public interface ISpaceRepository : IRepository<Space>
    {
        /// <summary>
        /// Add project to space
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="spaceId">Space ID</param>
        /// <param name="projectId">Project ID to add</param>
        /// <returns>True if added successfully</returns>
        Task<bool> AddProjectAsync(string siteId, Guid spaceId, Guid projectId);

        /// <summary>
        /// Remove project from space
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="spaceId">Space ID</param>
        /// <param name="projectId">Project ID to remove</param>
        /// <returns>True if removed successfully</returns>
        Task<bool> RemoveProjectAsync(string siteId, Guid spaceId, Guid projectId);
    }
}
