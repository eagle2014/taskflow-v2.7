using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Event repository implementation using Dapper and stored procedures
    /// </summary>
    public class EventRepository : IEventRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EventRepository> _logger;

        public EventRepository(IConfiguration configuration, ILogger<EventRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<CalendarEvent>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<CalendarEvent>("sp_Event_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<CalendarEvent?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, EventID = id };
            return await connection.QueryFirstOrDefaultAsync<CalendarEvent>("sp_Event_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<CalendarEvent> AddAsync(CalendarEvent entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.EventID,
                entity.SiteID,
                entity.Title,
                entity.Description,
                entity.TaskID,
                entity.Type,
                entity.Date,
                entity.StartTime,
                entity.EndTime,
                entity.Location,
                entity.Attendees,
                entity.Color,
                entity.ReminderMinutes,
                entity.CreatedBy
            };
            await connection.ExecuteAsync("sp_Event_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<CalendarEvent> UpdateAsync(string siteId, Guid id, CalendarEvent entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                EventID = id,
                entity.Title,
                entity.Description,
                entity.TaskID,
                entity.Type,
                entity.Date,
                entity.StartTime,
                entity.EndTime,
                entity.Location,
                entity.Attendees,
                entity.Color,
                entity.ReminderMinutes
            };
            await connection.ExecuteAsync("sp_Event_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, EventID = id };
            var result = await connection.ExecuteAsync("sp_Event_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<CalendarEvent>> GetByDateRangeAsync(string siteId, DateTime startDate, DateTime endDate)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, StartDate = startDate, EndDate = endDate };
            return await connection.QueryAsync<CalendarEvent>("sp_Event_GetByDateRange", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<CalendarEvent>> GetByTaskAsync(string siteId, Guid taskId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, TaskID = taskId };
            return await connection.QueryAsync<CalendarEvent>("sp_Event_GetByTask", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<CalendarEvent>> GetByTypeAsync(string siteId, string type)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Type = type };
            return await connection.QueryAsync<CalendarEvent>("sp_Event_GetByType", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}
