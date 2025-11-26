namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Base repository interface for common CRUD operations
    /// All repositories use stored procedures with multi-tenant support
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IRepository<T> where T : class
    {
        /// <summary>
        /// Get all entities for a specific site
        /// </summary>
        /// <param name="siteId">Site ID for multi-tenant filtering</param>
        /// <returns>Collection of entities</returns>
        Task<IEnumerable<T>> GetAllAsync(string siteId);

        /// <summary>
        /// Get entity by ID for a specific site
        /// </summary>
        /// <param name="siteId">Site ID for multi-tenant filtering</param>
        /// <param name="id">Entity ID</param>
        /// <returns>Entity or null if not found</returns>
        Task<T?> GetByIdAsync(string siteId, Guid id);

        /// <summary>
        /// Add new entity
        /// </summary>
        /// <param name="entity">Entity to add</param>
        /// <returns>Created entity</returns>
        Task<T> AddAsync(T entity);

        /// <summary>
        /// Update existing entity
        /// </summary>
        /// <param name="siteId">Site ID for multi-tenant filtering</param>
        /// <param name="id">Entity ID</param>
        /// <param name="entity">Updated entity data</param>
        /// <returns>Updated entity</returns>
        Task<T> UpdateAsync(string siteId, Guid id, T entity);

        /// <summary>
        /// Delete entity (soft delete with IsDeleted flag)
        /// </summary>
        /// <param name="siteId">Site ID for multi-tenant filtering</param>
        /// <param name="id">Entity ID</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteAsync(string siteId, Guid id);
    }
}
