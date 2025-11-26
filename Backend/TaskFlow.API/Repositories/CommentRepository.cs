using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Repositories
{
    /// <summary>
    /// Comment repository implementation using Dapper and stored procedures
    /// </summary>
    public class CommentRepository : ICommentRepository
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CommentRepository> _logger;

        public CommentRepository(IConfiguration configuration, ILogger<CommentRepository> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<Comment>> GetAllAsync(string siteId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId };
            return await connection.QueryAsync<Comment>("sp_Comment_GetAll", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Comment?> GetByIdAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, CommentID = id };
            return await connection.QueryFirstOrDefaultAsync<Comment>("sp_Comment_GetById", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<Comment> AddAsync(Comment entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                entity.CommentID,
                entity.SiteID,
                entity.TaskID,
                entity.UserID,
                entity.Content,
                entity.ParentCommentID
            };
            await connection.ExecuteAsync("sp_Comment_Create", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<Comment> UpdateAsync(string siteId, Guid id, Comment entity)
        {
            using var connection = GetConnection();
            var parameters = new
            {
                SiteID = siteId,
                CommentID = id,
                entity.Content
            };
            await connection.ExecuteAsync("sp_Comment_Update", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return entity;
        }

        public async Task<bool> DeleteAsync(string siteId, Guid id)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, CommentID = id };
            var result = await connection.ExecuteAsync("sp_Comment_Delete", parameters, commandType: System.Data.CommandType.StoredProcedure);
            return result > 0;
        }

        public async Task<IEnumerable<Comment>> GetByTaskAsync(string siteId, Guid taskId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, TaskID = taskId };
            return await connection.QueryAsync<Comment>("sp_Comment_GetByTask", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Comment>> GetByUserAsync(string siteId, Guid userId)
        {
            using var connection = GetConnection();
            var parameters = new { SiteID = siteId, UserID = userId };
            return await connection.QueryAsync<Comment>("sp_Comment_GetByUser", parameters, commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}
