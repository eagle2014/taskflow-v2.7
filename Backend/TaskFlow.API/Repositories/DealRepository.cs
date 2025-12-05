using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs;
using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories;

public interface IDealRepository
{
    Task<IEnumerable<DealDTO>> GetAllAsync(string siteId);
    Task<DealDTO?> GetByIdAsync(string siteId, Guid id);
    Task<Deal> CreateAsync(Deal entity);
    Task<Deal> UpdateAsync(string siteId, Guid id, Deal entity);
    Task<bool> DeleteAsync(string siteId, Guid id);
    Task<IEnumerable<DealDTO>> SearchAsync(string siteId, DealSearchDTO searchDTO);
    Task<IEnumerable<DealDTO>> GetByCustomerIdAsync(string siteId, Guid customerId);
}

public class DealRepository : IDealRepository
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DealRepository> _logger;

    public DealRepository(IConfiguration configuration, ILogger<DealRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private SqlConnection GetConnection()
    {
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<DealDTO>> GetAllAsync(string siteId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT d.DealID, d.SiteID, d.CustomerID, cu.CustomerName,
                   d.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   d.DealCode, d.DealName, d.Description, d.DealValue, d.Currency,
                   d.Stage, d.Probability, d.ExpectedCloseDate, d.ActualCloseDate,
                   d.Status, d.LostReason, d.OwnerID, u.Name as OwnerName,
                   d.Source, d.CreatedAt, d.UpdatedAt
            FROM Deals d
            INNER JOIN Customers cu ON d.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON d.ContactID = c.ContactID
            LEFT JOIN Users u ON d.OwnerID = u.UserID
            WHERE d.SiteID = @SiteID AND d.IsDeleted = 0
            ORDER BY d.CreatedAt DESC";
        return await connection.QueryAsync<DealDTO>(sql, new { SiteID = siteId });
    }

    public async Task<DealDTO?> GetByIdAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT d.DealID, d.SiteID, d.CustomerID, cu.CustomerName,
                   d.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   d.DealCode, d.DealName, d.Description, d.DealValue, d.Currency,
                   d.Stage, d.Probability, d.ExpectedCloseDate, d.ActualCloseDate,
                   d.Status, d.LostReason, d.OwnerID, u.Name as OwnerName,
                   d.Source, d.CreatedAt, d.UpdatedAt
            FROM Deals d
            INNER JOIN Customers cu ON d.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON d.ContactID = c.ContactID
            LEFT JOIN Users u ON d.OwnerID = u.UserID
            WHERE d.SiteID = @SiteID AND d.DealID = @DealID AND d.IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<DealDTO>(sql, new { SiteID = siteId, DealID = id });
    }

    public async Task<Deal> CreateAsync(Deal entity)
    {
        using var connection = GetConnection();
        var sql = @"
            INSERT INTO Deals (DealID, SiteID, CustomerID, ContactID, DealCode, DealName, Description,
                               DealValue, Currency, Stage, Probability, ExpectedCloseDate, ActualCloseDate,
                               Status, LostReason, OwnerID, Source,
                               CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
            VALUES (@DealID, @SiteID, @CustomerID, @ContactID, @DealCode, @DealName, @Description,
                    @DealValue, @Currency, @Stage, @Probability, @ExpectedCloseDate, @ActualCloseDate,
                    @Status, @LostReason, @OwnerID, @Source,
                    @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0)";
        await connection.ExecuteAsync(sql, entity);
        return entity;
    }

    public async Task<Deal> UpdateAsync(string siteId, Guid id, Deal entity)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Deals
            SET CustomerID = @CustomerID, ContactID = @ContactID, DealName = @DealName, Description = @Description,
                DealValue = @DealValue, Currency = @Currency, Stage = @Stage, Probability = @Probability,
                ExpectedCloseDate = @ExpectedCloseDate, ActualCloseDate = @ActualCloseDate,
                Status = @Status, LostReason = @LostReason, OwnerID = @OwnerID, Source = @Source,
                UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND DealID = @DealID AND IsDeleted = 0";

        var parameters = new
        {
            SiteID = siteId,
            DealID = id,
            entity.CustomerID,
            entity.ContactID,
            entity.DealName,
            entity.Description,
            entity.DealValue,
            entity.Currency,
            entity.Stage,
            entity.Probability,
            entity.ExpectedCloseDate,
            entity.ActualCloseDate,
            entity.Status,
            entity.LostReason,
            entity.OwnerID,
            entity.Source
        };
        await connection.ExecuteAsync(sql, parameters);
        return entity;
    }

    public async Task<bool> DeleteAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Deals
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND DealID = @DealID AND IsDeleted = 0";
        var result = await connection.ExecuteAsync(sql, new { SiteID = siteId, DealID = id });
        return result > 0;
    }

    public async Task<IEnumerable<DealDTO>> SearchAsync(string siteId, DealSearchDTO searchDTO)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT d.DealID, d.SiteID, d.CustomerID, cu.CustomerName,
                   d.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   d.DealCode, d.DealName, d.Description, d.DealValue, d.Currency,
                   d.Stage, d.Probability, d.ExpectedCloseDate, d.ActualCloseDate,
                   d.Status, d.LostReason, d.OwnerID, u.Name as OwnerName,
                   d.Source, d.CreatedAt, d.UpdatedAt
            FROM Deals d
            INNER JOIN Customers cu ON d.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON d.ContactID = c.ContactID
            LEFT JOIN Users u ON d.OwnerID = u.UserID
            WHERE d.SiteID = @SiteID AND d.IsDeleted = 0
                AND (@SearchTerm IS NULL OR d.DealName LIKE '%' + @SearchTerm + '%' OR d.DealCode LIKE '%' + @SearchTerm + '%')
                AND (@CustomerID IS NULL OR d.CustomerID = @CustomerID)
                AND (@Stage IS NULL OR d.Stage = @Stage)
                AND (@Status IS NULL OR d.Status = @Status)
                AND (@OwnerID IS NULL OR d.OwnerID = @OwnerID)
            ORDER BY d.CreatedAt DESC
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        return await connection.QueryAsync<DealDTO>(sql, searchDTO);
    }

    public async Task<IEnumerable<DealDTO>> GetByCustomerIdAsync(string siteId, Guid customerId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT d.DealID, d.SiteID, d.CustomerID, cu.CustomerName,
                   d.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   d.DealCode, d.DealName, d.Description, d.DealValue, d.Currency,
                   d.Stage, d.Probability, d.ExpectedCloseDate, d.ActualCloseDate,
                   d.Status, d.LostReason, d.OwnerID, u.Name as OwnerName,
                   d.Source, d.CreatedAt, d.UpdatedAt
            FROM Deals d
            INNER JOIN Customers cu ON d.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON d.ContactID = c.ContactID
            LEFT JOIN Users u ON d.OwnerID = u.UserID
            WHERE d.SiteID = @SiteID AND d.CustomerID = @CustomerID AND d.IsDeleted = 0
            ORDER BY d.CreatedAt DESC";
        return await connection.QueryAsync<DealDTO>(sql, new { SiteID = siteId, CustomerID = customerId });
    }
}