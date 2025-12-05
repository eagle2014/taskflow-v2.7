using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs;
using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories;

public interface IContactRepository
{
    Task<IEnumerable<ContactDTO>> GetAllAsync(string siteId);
    Task<ContactDTO?> GetByIdAsync(string siteId, Guid id);
    Task<Contact> CreateAsync(Contact entity);
    Task<Contact> UpdateAsync(string siteId, Guid id, Contact entity);
    Task<bool> DeleteAsync(string siteId, Guid id);
    Task<IEnumerable<ContactDTO>> SearchAsync(string siteId, ContactSearchDTO searchDTO);
    Task<IEnumerable<ContactDTO>> GetByCustomerIdAsync(string siteId, Guid customerId);
}

public class ContactRepository : IContactRepository
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ContactRepository> _logger;

    public ContactRepository(IConfiguration configuration, ILogger<ContactRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private SqlConnection GetConnection()
    {
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<ContactDTO>> GetAllAsync(string siteId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT c.ContactID, c.SiteID, c.CustomerID, cu.CustomerName,
                   c.FirstName, c.LastName, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   c.Email, c.Phone, c.Mobile, c.Position, c.Department,
                   c.IsPrimary, c.Status, c.LinkedIn, c.Notes, c.CreatedAt, c.UpdatedAt
            FROM Contacts c
            LEFT JOIN Customers cu ON c.CustomerID = cu.CustomerID
            WHERE c.SiteID = @SiteID AND c.IsDeleted = 0
            ORDER BY c.CreatedAt DESC";
        return await connection.QueryAsync<ContactDTO>(sql, new { SiteID = siteId });
    }

    public async Task<ContactDTO?> GetByIdAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT c.ContactID, c.SiteID, c.CustomerID, cu.CustomerName,
                   c.FirstName, c.LastName, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   c.Email, c.Phone, c.Mobile, c.Position, c.Department,
                   c.IsPrimary, c.Status, c.LinkedIn, c.Notes, c.CreatedAt, c.UpdatedAt
            FROM Contacts c
            LEFT JOIN Customers cu ON c.CustomerID = cu.CustomerID
            WHERE c.SiteID = @SiteID AND c.ContactID = @ContactID AND c.IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<ContactDTO>(sql, new { SiteID = siteId, ContactID = id });
    }

    public async Task<Contact> CreateAsync(Contact entity)
    {
        using var connection = GetConnection();
        var sql = @"
            INSERT INTO Contacts (ContactID, SiteID, CustomerID, FirstName, LastName, Email, Phone, Mobile,
                                  Position, Department, IsPrimary, Status, LinkedIn, Notes,
                                  CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
            VALUES (@ContactID, @SiteID, @CustomerID, @FirstName, @LastName, @Email, @Phone, @Mobile,
                    @Position, @Department, @IsPrimary, @Status, @LinkedIn, @Notes,
                    @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0)";
        await connection.ExecuteAsync(sql, entity);
        return entity;
    }

    public async Task<Contact> UpdateAsync(string siteId, Guid id, Contact entity)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Contacts
            SET CustomerID = @CustomerID, FirstName = @FirstName, LastName = @LastName,
                Email = @Email, Phone = @Phone, Mobile = @Mobile,
                Position = @Position, Department = @Department,
                IsPrimary = @IsPrimary, Status = @Status, LinkedIn = @LinkedIn, Notes = @Notes,
                UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND ContactID = @ContactID AND IsDeleted = 0";

        var parameters = new
        {
            SiteID = siteId,
            ContactID = id,
            entity.CustomerID,
            entity.FirstName,
            entity.LastName,
            entity.Email,
            entity.Phone,
            entity.Mobile,
            entity.Position,
            entity.Department,
            entity.IsPrimary,
            entity.Status,
            entity.LinkedIn,
            entity.Notes
        };
        await connection.ExecuteAsync(sql, parameters);
        return entity;
    }

    public async Task<bool> DeleteAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Contacts
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND ContactID = @ContactID AND IsDeleted = 0";
        var result = await connection.ExecuteAsync(sql, new { SiteID = siteId, ContactID = id });
        return result > 0;
    }

    public async Task<IEnumerable<ContactDTO>> SearchAsync(string siteId, ContactSearchDTO searchDTO)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT c.ContactID, c.SiteID, c.CustomerID, cu.CustomerName,
                   c.FirstName, c.LastName, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   c.Email, c.Phone, c.Mobile, c.Position, c.Department,
                   c.IsPrimary, c.Status, c.LinkedIn, c.Notes, c.CreatedAt, c.UpdatedAt
            FROM Contacts c
            LEFT JOIN Customers cu ON c.CustomerID = cu.CustomerID
            WHERE c.SiteID = @SiteID AND c.IsDeleted = 0
                AND (@SearchTerm IS NULL OR c.FirstName LIKE '%' + @SearchTerm + '%' OR c.LastName LIKE '%' + @SearchTerm + '%' OR c.Email LIKE '%' + @SearchTerm + '%')
                AND (@CustomerID IS NULL OR c.CustomerID = @CustomerID)
                AND (@Status IS NULL OR c.Status = @Status)
            ORDER BY c.CreatedAt DESC
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        return await connection.QueryAsync<ContactDTO>(sql, searchDTO);
    }

    public async Task<IEnumerable<ContactDTO>> GetByCustomerIdAsync(string siteId, Guid customerId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT c.ContactID, c.SiteID, c.CustomerID, cu.CustomerName,
                   c.FirstName, c.LastName, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   c.Email, c.Phone, c.Mobile, c.Position, c.Department,
                   c.IsPrimary, c.Status, c.LinkedIn, c.Notes, c.CreatedAt, c.UpdatedAt
            FROM Contacts c
            LEFT JOIN Customers cu ON c.CustomerID = cu.CustomerID
            WHERE c.SiteID = @SiteID AND c.CustomerID = @CustomerID AND c.IsDeleted = 0
            ORDER BY c.IsPrimary DESC, c.CreatedAt DESC";
        return await connection.QueryAsync<ContactDTO>(sql, new { SiteID = siteId, CustomerID = customerId });
    }
}