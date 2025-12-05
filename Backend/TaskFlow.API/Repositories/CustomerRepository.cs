using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs;
using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<CustomerDTO>> GetAllAsync(string siteId);
    Task<CustomerDTO?> GetByIdAsync(string siteId, Guid id);
    Task<Customer> CreateAsync(Customer entity);
    Task<Customer> UpdateAsync(string siteId, Guid id, Customer entity);
    Task<bool> DeleteAsync(string siteId, Guid id);
    Task<IEnumerable<CustomerDTO>> SearchAsync(string siteId, CustomerSearchDTO searchDTO);
}

public class CustomerRepository : ICustomerRepository
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<CustomerRepository> _logger;

    public CustomerRepository(IConfiguration configuration, ILogger<CustomerRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private SqlConnection GetConnection()
    {
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<CustomerDTO>> GetAllAsync(string siteId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT CustomerID, SiteID, CustomerCode, CustomerName, CustomerType,
                   Industry, Website, TaxCode, Phone, Email, Address, City, Country,
                   AnnualRevenue, EmployeeCount, Status, Source, Notes, CreatedAt, UpdatedAt
            FROM Customers
            WHERE SiteID = @SiteID AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<CustomerDTO>(sql, new { SiteID = siteId });
    }

    public async Task<CustomerDTO?> GetByIdAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT CustomerID, SiteID, CustomerCode, CustomerName, CustomerType,
                   Industry, Website, TaxCode, Phone, Email, Address, City, Country,
                   AnnualRevenue, EmployeeCount, Status, Source, Notes, CreatedAt, UpdatedAt
            FROM Customers
            WHERE SiteID = @SiteID AND CustomerID = @CustomerID AND IsDeleted = 0";
        return await connection.QueryFirstOrDefaultAsync<CustomerDTO>(sql, new { SiteID = siteId, CustomerID = id });
    }

    public async Task<Customer> CreateAsync(Customer entity)
    {
        using var connection = GetConnection();
        var sql = @"
            INSERT INTO Customers (CustomerID, SiteID, CustomerCode, CustomerName, CustomerType,
                                   Industry, Website, TaxCode, Phone, Email, Address, City, Country,
                                   AnnualRevenue, EmployeeCount, Status, Source, Notes, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
            VALUES (@CustomerID, @SiteID, @CustomerCode, @CustomerName, @CustomerType,
                    @Industry, @Website, @TaxCode, @Phone, @Email, @Address, @City, @Country,
                    @AnnualRevenue, @EmployeeCount, @Status, @Source, @Notes, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0)";
        await connection.ExecuteAsync(sql, entity);
        return entity;
    }

    public async Task<Customer> UpdateAsync(string siteId, Guid id, Customer entity)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Customers
            SET CustomerName = @CustomerName, CustomerType = @CustomerType,
                Industry = @Industry, Website = @Website, TaxCode = @TaxCode,
                Phone = @Phone, Email = @Email, Address = @Address, City = @City, Country = @Country,
                AnnualRevenue = @AnnualRevenue, EmployeeCount = @EmployeeCount,
                Status = @Status, Source = @Source, Notes = @Notes, UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND CustomerID = @CustomerID AND IsDeleted = 0";

        var parameters = new
        {
            SiteID = siteId,
            CustomerID = id,
            entity.CustomerName,
            entity.CustomerType,
            entity.Industry,
            entity.Website,
            entity.TaxCode,
            entity.Phone,
            entity.Email,
            entity.Address,
            entity.City,
            entity.Country,
            entity.AnnualRevenue,
            entity.EmployeeCount,
            entity.Status,
            entity.Source,
            entity.Notes
        };
        await connection.ExecuteAsync(sql, parameters);
        return entity;
    }

    public async Task<bool> DeleteAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Customers
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND CustomerID = @CustomerID AND IsDeleted = 0";
        var result = await connection.ExecuteAsync(sql, new { SiteID = siteId, CustomerID = id });
        return result > 0;
    }

    public async Task<IEnumerable<CustomerDTO>> SearchAsync(string siteId, CustomerSearchDTO searchDTO)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT CustomerID, SiteID, CustomerCode, CustomerName, CustomerType,
                   Industry, Website, TaxCode, Phone, Email, Address, City, Country,
                   AnnualRevenue, EmployeeCount, Status, Source, Notes, CreatedAt, UpdatedAt
            FROM Customers
            WHERE SiteID = @SiteID AND IsDeleted = 0
                AND (@SearchTerm IS NULL OR CustomerName LIKE '%' + @SearchTerm + '%' OR CustomerCode LIKE '%' + @SearchTerm + '%')
                AND (@CustomerType IS NULL OR CustomerType = @CustomerType)
                AND (@Status IS NULL OR Status = @Status)
                AND (@Industry IS NULL OR Industry = @Industry)
            ORDER BY CreatedAt DESC
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        return await connection.QueryAsync<CustomerDTO>(sql, searchDTO);
    }
}