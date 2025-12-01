using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Task repository interface with multi-tenant support
    /// </summary>
    public interface ITaskRepository : IRepository<Models.Entities.Task>
    {
        /// <summary>
        /// Get tasks by project for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="projectId">Project ID</param>
        /// <returns>Collection of tasks</returns>
        Task<IEnumerable<Models.Entities.Task>> GetByProjectAsync(string siteId, Guid projectId);

        /// <summary>
        /// Get tasks by assignee for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="assigneeId">Assignee user ID</param>
        /// <returns>Collection of tasks</returns>
        Task<IEnumerable<Models.Entities.Task>> GetByAssigneeAsync(string siteId, Guid assigneeId);

        /// <summary>
        /// Get tasks by status for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="status">Task status</param>
        /// <returns>Collection of tasks</returns>
        Task<IEnumerable<Models.Entities.Task>> GetByStatusAsync(string siteId, string status);

        /// <summary>
        /// Get overdue tasks for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <returns>Collection of overdue tasks</returns>
        Task<IEnumerable<Models.Entities.Task>> GetOverdueAsync(string siteId);

        /// <summary>
        /// Get tasks due within specified days for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="days">Number of days</param>
        /// <returns>Collection of tasks due soon</returns>
        Task<IEnumerable<Models.Entities.Task>> GetDueSoonAsync(string siteId, int days);

        /// <summary>
        /// Get subtasks by parent task ID for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="parentTaskId">Parent task ID</param>
        /// <returns>Collection of subtasks</returns>
        Task<IEnumerable<Models.Entities.Task>> GetByParentTaskAsync(string siteId, Guid parentTaskId);
    }
}
