using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Space repository implementation using Dapper and stored procedures
    /// </summary>
    public class SpaceRepository : ISpaceRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SpaceRepository> _logger;

        public SpaceRepository(IConfiguration configuration, ILogger<SpaceRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<Space>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Space>("sp_Space_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Space?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, SpaceID = id };
            return await connection.QueryFirstOrDefaultAsync<Space>("sp_Space_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Space> AddAsync(Space entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.SpaceID,
                entity.SiteID,
                entity.ProjectID,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Icon,
                entity.Order,
                entity.ProjectIDs,
                entity.CreatedBy
            };
            await connection.ExecuteAsync("sp_Space_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<Space> UpdateAsync(string siteId, Guid id, Space entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                SpaceID = id,
                entity.ProjectID,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Icon,
                entity.Order,
                entity.ProjectIDs
            };
            await connection.ExecuteAsync("sp_Space_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, SpaceID = id };
            var result = await connection.ExecuteAsync("sp_Space_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<bool> AddProjectAsync(string siteId, Guid spaceId, Guid projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, SpaceID = spaceId, ProjectID = projectId };
            var result = await connection.ExecuteAsync("sp_Space_AddProject", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<bool> RemoveProjectAsync(string siteId, Guid spaceId, Guid projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, SpaceID = spaceId, ProjectID = projectId };
            var result = await connection.ExecuteAsync("sp_Space_RemoveProject", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }
    }
}
