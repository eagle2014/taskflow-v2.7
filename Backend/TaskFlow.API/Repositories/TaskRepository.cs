using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Task repository implementation using Dapper and stored procedures
    /// </summary>
    public class TaskRepository : ITaskRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<TaskRepository> _logger;

        public TaskRepository(IConfiguration configuration, ILogger<TaskRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Models.Entities.Task?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, TaskID = id };
            return await connection.QueryFirstOrDefaultAsync<Models.Entities.Task>("sp_Task_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Models.Entities.Task> AddAsync(Models.Entities.Task entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.TaskID,
                entity.SiteID,
                entity.ProjectID,
                entity.PhaseID,
                entity.ParentTaskID,
                entity.Order,
                entity.Title,
                entity.Description,
                entity.Status,
                entity.Priority,
                entity.AssigneeID,
                entity.DueDate,
                entity.StartDate,
                entity.EstimatedHours,
                entity.ActualHours,
                entity.Progress,
                entity.Budget,
                entity.Spent,
                entity.Tags,
                entity.CreatedBy
            };
            await connection.ExecuteAsync("sp_Task_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<Models.Entities.Task> UpdateAsync(string siteId, Guid id, Models.Entities.Task entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                TaskID = id,
                entity.PhaseID,
                entity.ParentTaskID,
                entity.Order,
                entity.Title,
                entity.Description,
                entity.Status,
                entity.Priority,
                entity.AssigneeID,
                entity.DueDate,
                entity.StartDate,
                entity.EstimatedHours,
                entity.ActualHours,
                entity.Progress,
                entity.Budget,
                entity.Spent,
                entity.Tags
            };
            await connection.ExecuteAsync("sp_Task_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, TaskID = id };
            var result = await connection.ExecuteAsync("sp_Task_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetByProjectAsync(string siteId, Guid projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = projectId };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetByProject", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetByAssigneeAsync(string siteId, Guid assigneeId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, AssigneeID = assigneeId };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetByAssignee", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetByStatusAsync(string siteId, string status)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Status = status };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetByStatus", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetOverdueAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetOverdue", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetDueSoonAsync(string siteId, int days)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Days = days };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetDueSoon", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Models.Entities.Task>> GetByParentTaskAsync(string siteId, Guid parentTaskId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ParentTaskID = parentTaskId };
            return await connection.QueryAsync<Models.Entities.Task>("sp_Task_GetByParentTask", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}
