using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Phase repository implementation using Dapper and stored procedures
    /// </summary>
    public class PhaseRepository : IPhaseRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PhaseRepository> _logger;

        public PhaseRepository(IConfiguration configuration, ILogger<PhaseRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<Phase>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Phase>("sp_Phase_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Phase?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, PhaseID = id };
            return await connection.QueryFirstOrDefaultAsync<Phase>("sp_Phase_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Phase> AddAsync(Phase entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.PhaseID,
                entity.SiteID,
                entity.ProjectID,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Order,
                entity.StartDate,
                entity.EndDate,
                entity.CreatedBy
            };
            await connection.ExecuteAsync("sp_Phase_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<Phase> UpdateAsync(string siteId, Guid id, Phase entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                PhaseID = id,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Order,
                entity.StartDate,
                entity.EndDate
            };
            await connection.ExecuteAsync("sp_Phase_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, PhaseID = id };
            var result = await connection.ExecuteAsync("sp_Phase_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<Phase>> GetByProjectAsync(string siteId, Guid projectId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, ProjectID = projectId };
            return await connection.QueryAsync<Phase>("sp_Phase_GetByProject", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<bool> ReorderAsync(string siteId, Guid projectId, List<Guid> phaseIds)
        {
            using var connection = GetConnection();

            // Reorder phases by updating their Order
            for (int i = 0; i < phaseIds.Count; i++)
            {
                var parameters = new
                {
                    SiteID = siteId,
                    ProjectID = projectId,
                    PhaseID = phaseIds[i],
                    Order = i + 1
                };
                await connection.ExecuteAsync("sp_Phase_Reorder", parameters, commandType: System.Data.CommandType.StoredProcedure);
            }

            return true;
        }
    }
}
