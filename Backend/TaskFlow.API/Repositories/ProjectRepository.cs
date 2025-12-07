using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Project repository implementation using Dapper and stored procedures
    /// ProjectID is human-readable code (e.g., "PRJ-0001"), RowPointer is internal GUID
    /// </summary>
    public class ProjectRepository : IProjectRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ProjectRepository> _logger;

        public ProjectRepository(IConfiguration configuration, ILogger<ProjectRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<Project>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Project>("sp_Project_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Project?> GetByIdAsync(string siteId, string projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = projectId };
            return await connection.QueryFirstOrDefaultAsync<Project>("sp_Project_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Project?> GetByRowPointerAsync(string siteId, Guid rowPointer)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, RowPointer = rowPointer };
            return await connection.QueryFirstOrDefaultAsync<Project>("sp_Project_GetByRowPointer", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Project> AddAsync(Project entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.RowPointer,
                entity.SiteID,
                entity.ProjectID,
                entity.Name,
                entity.Description,
                entity.CategoryID,
                entity.Status,
                entity.Priority,
                entity.StartDate,
                entity.EndDate,
                entity.AssigneeID,
                entity.CustomerID,
                entity.ContactID,
                entity.DealID,
                entity.ActualEndDate,
                entity.ProjectUrl,
                entity.Progress,
                entity.CreatedBy
            };

            // Get the auto-generated ProjectID if not provided
            var result = await connection.QueryFirstOrDefaultAsync<string>("sp_Project_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            if (!string.IsNullOrEmpty(result))
            {
                entity.ProjectID = result;
            }
            return entity;
        }

        public async Task<Project> UpdateAsync(string siteId, string projectId, Project entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                ProjectID = projectId,
                entity.Name,
                entity.Description,
                entity.CategoryID,
                entity.Status,
                entity.Priority,
                entity.StartDate,
                entity.EndDate,
                entity.AssigneeID,
                entity.CustomerID,
                entity.ContactID,
                entity.DealID,
                entity.ActualEndDate,
                entity.ProjectUrl,
                entity.Progress
            };
            await connection.ExecuteAsync("sp_Project_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, string projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = projectId };
            var result = await connection.ExecuteAsync("sp_Project_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<Project>> GetByCategoryAsync(string siteId, string categoryId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, CategoryID = categoryId };
            return await connection.QueryAsync<Project>("sp_Project_GetByCategory", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Project>> GetByStatusAsync(string siteId, string status)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Status = status };
            return await connection.QueryAsync<Project>("sp_Project_GetByStatus", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}