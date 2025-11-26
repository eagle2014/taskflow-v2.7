using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Project repository implementation using Dapper and stored procedures
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

        public async Task<Project?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = id };
            return await connection.QueryFirstOrDefaultAsync<Project>("sp_Project_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Project> AddAsync(Project entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.ProjectID,
                entity.SiteID,
                entity.Name,
                entity.Description,
                entity.CategoryID,
                entity.Status,
                entity.Priority,
                entity.StartDate,
                entity.EndDate,
                entity.CreatedBy
            };
            await connection.ExecuteAsync("sp_Project_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<Project> UpdateAsync(string siteId, Guid id, Project entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                ProjectID = id,
                entity.Name,
                entity.Description,
                entity.CategoryID,
                entity.Status,
                entity.Priority,
                entity.StartDate,
                entity.EndDate
            };
            await connection.ExecuteAsync("sp_Project_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = id };
            var result = await connection.ExecuteAsync("sp_Project_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<Project>> GetByCategoryAsync(string siteId, Guid categoryId)
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
