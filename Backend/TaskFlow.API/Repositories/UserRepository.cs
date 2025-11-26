using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// User repository implementation using Dapper and stored procedures
    /// </summary>
    public class UserRepository : IUserRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserRepository> _logger;

        public UserRepository(IConfiguration configuration, ILogger<UserRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<User>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<User>("sp_User_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<User?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, UserID = id };
            return await connection.QueryFirstOrDefaultAsync<User>("sp_User_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<User> AddAsync(User entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.UserID,
                entity.SiteID,
                entity.Name,
                entity.Email,
                entity.PasswordHash,
                entity.Role,
                entity.Status,
                entity.Avatar
            };
            await connection.ExecuteAsync("sp_User_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<User> UpdateAsync(string siteId, Guid id, User entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                UserID = id,
                entity.Name,
                entity.Email,
                entity.PasswordHash,
                entity.Role,
                entity.Status,
                entity.Avatar
            };
            await connection.ExecuteAsync("sp_User_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, UserID = id };
            var result = await connection.ExecuteAsync("sp_User_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<User?> GetByEmailAsync(string siteId, string email)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Email = email };
            return await connection.QueryFirstOrDefaultAsync<User>("sp_User_GetByEmail", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<User>> GetByRoleAsync(string siteId, string role)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Role = role };
            return await connection.QueryAsync<User>("sp_User_GetByRole", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<User>> GetByStatusAsync(string siteId, string status)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, Status = status };
            return await connection.QueryAsync<User>("sp_User_GetByStatus", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<bool> UpdateLastActiveAsync(string siteId, Guid userId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, UserID = userId };
            var result = await connection.ExecuteAsync("sp_User_UpdateLastActive", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }
    }
}
