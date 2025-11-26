using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories.Interfaces
{
    /// <summary>
    /// Calendar event repository interface with multi-tenant support
    /// </summary>
    public interface IEventRepository : IRepository<CalendarEvent>
    {
        /// <summary>
        /// Get events by date range for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Collection of events</returns>
        Task<IEnumerable<CalendarEvent>> GetByDateRangeAsync(string siteId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get events by task for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="taskId">Task ID</param>
        /// <returns>Collection of events</returns>
        Task<IEnumerable<CalendarEvent>> GetByTaskAsync(string siteId, Guid taskId);

        /// <summary>
        /// Get events by type for a specific site
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <param name="type">Event type</param>
        /// <returns>Collection of events</returns>
        Task<IEnumerable<CalendarEvent>> GetByTypeAsync(string siteId, string type);
    }
}
