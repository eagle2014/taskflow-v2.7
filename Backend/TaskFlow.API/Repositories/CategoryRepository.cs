using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Category repository implementation using Dapper and stored procedures
    /// </summary>
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CategoryRepository> _logger;

        public CategoryRepository(IConfiguration configuration, ILogger<CategoryRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<ProjectCategory>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<ProjectCategory>("sp_Category_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<ProjectCategory?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, CategoryID = id };
            return await connection.QueryFirstOrDefaultAsync<ProjectCategory>("sp_Category_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<ProjectCategory> AddAsync(ProjectCategory entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.CategoryID,
                entity.SiteID,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Icon
            };
            await connection.ExecuteAsync("sp_Category_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<ProjectCategory> UpdateAsync(string siteId, Guid id, ProjectCategory entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                CategoryID = id,
                entity.Name,
                entity.Description,
                entity.Color,
                entity.Icon
            };
            await connection.ExecuteAsync("sp_Category_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, CategoryID = id };
            var result = await connection.ExecuteAsync("sp_Category_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<ProjectCategory?> GetByNameAsync(string siteId, string name)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Name = name };
            return await connection.QueryFirstOrDefaultAsync<ProjectCategory>("sp_Category_GetByName", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}
