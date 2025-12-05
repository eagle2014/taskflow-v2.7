using Dapper;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs;
using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Repositories;

public interface IQuoteRepository
{
    Task<IEnumerable<QuoteDTO>> GetAllAsync(string siteId);
    Task<QuoteDTO?> GetByIdAsync(string siteId, Guid id);
    Task<Quote> CreateAsync(Quote entity, List<QuoteItem> items);
    Task<Quote> UpdateAsync(string siteId, Guid id, Quote entity, List<QuoteItem> items);
    Task<bool> DeleteAsync(string siteId, Guid id);
    Task<IEnumerable<QuoteDTO>> SearchAsync(string siteId, QuoteSearchDTO searchDTO);
    Task<IEnumerable<QuoteDTO>> GetByDealIdAsync(string siteId, Guid dealId);
}

public class QuoteRepository : IQuoteRepository
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<QuoteRepository> _logger;

    public QuoteRepository(IConfiguration configuration, ILogger<QuoteRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private SqlConnection GetConnection()
    {
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<QuoteDTO>> GetAllAsync(string siteId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT q.QuoteID, q.SiteID, q.DealID, d.DealName,
                   q.CustomerID, cu.CustomerName,
                   q.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   q.QuoteNumber, q.QuoteName, q.Version,
                   q.QuoteDate, q.ValidUntil,
                   q.SubTotal, q.DiscountPercent, q.DiscountAmount,
                   q.TaxPercent, q.TaxAmount, q.TotalAmount, q.Currency,
                   q.Status, q.PaymentTerms, q.DeliveryTerms, q.Notes,
                   q.CreatedAt, q.UpdatedAt
            FROM Quotes q
            INNER JOIN Deals d ON q.DealID = d.DealID
            INNER JOIN Customers cu ON q.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON q.ContactID = c.ContactID
            WHERE q.SiteID = @SiteID AND q.IsDeleted = 0
            ORDER BY q.CreatedAt DESC";

        var quotes = (await connection.QueryAsync<QuoteDTO>(sql, new { SiteID = siteId })).ToList();

        // Load items for each quote
        foreach (var quote in quotes)
        {
            quote.Items = (await GetQuoteItemsAsync(connection, quote.QuoteID)).ToList();
        }

        return quotes;
    }

    public async Task<QuoteDTO?> GetByIdAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT q.QuoteID, q.SiteID, q.DealID, d.DealName,
                   q.CustomerID, cu.CustomerName,
                   q.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   q.QuoteNumber, q.QuoteName, q.Version,
                   q.QuoteDate, q.ValidUntil,
                   q.SubTotal, q.DiscountPercent, q.DiscountAmount,
                   q.TaxPercent, q.TaxAmount, q.TotalAmount, q.Currency,
                   q.Status, q.PaymentTerms, q.DeliveryTerms, q.Notes,
                   q.CreatedAt, q.UpdatedAt
            FROM Quotes q
            INNER JOIN Deals d ON q.DealID = d.DealID
            INNER JOIN Customers cu ON q.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON q.ContactID = c.ContactID
            WHERE q.SiteID = @SiteID AND q.QuoteID = @QuoteID AND q.IsDeleted = 0";

        var quote = await connection.QueryFirstOrDefaultAsync<QuoteDTO>(sql, new { SiteID = siteId, QuoteID = id });
        if (quote != null)
        {
            quote.Items = (await GetQuoteItemsAsync(connection, quote.QuoteID)).ToList();
        }

        return quote;
    }

    private async Task<IEnumerable<QuoteItemDTO>> GetQuoteItemsAsync(SqlConnection connection, Guid quoteId)
    {
        var sql = @"
            SELECT QuoteItemID, QuoteID, ItemOrder, ItemName, ItemDescription,
                   Quantity, Unit, UnitPrice, DiscountPercent, Amount
            FROM QuoteItems
            WHERE QuoteID = @QuoteID
            ORDER BY ItemOrder";
        return await connection.QueryAsync<QuoteItemDTO>(sql, new { QuoteID = quoteId });
    }

    public async Task<Quote> CreateAsync(Quote entity, List<QuoteItem> items)
    {
        using var connection = GetConnection();
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Insert quote
            var quoteSql = @"
                INSERT INTO Quotes (QuoteID, SiteID, DealID, CustomerID, ContactID,
                                    QuoteNumber, QuoteName, Version, QuoteDate, ValidUntil,
                                    SubTotal, DiscountPercent, DiscountAmount,
                                    TaxPercent, TaxAmount, TotalAmount, Currency,
                                    Status, PaymentTerms, DeliveryTerms, Notes,
                                    CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
                VALUES (@QuoteID, @SiteID, @DealID, @CustomerID, @ContactID,
                        @QuoteNumber, @QuoteName, @Version, @QuoteDate, @ValidUntil,
                        @SubTotal, @DiscountPercent, @DiscountAmount,
                        @TaxPercent, @TaxAmount, @TotalAmount, @Currency,
                        @Status, @PaymentTerms, @DeliveryTerms, @Notes,
                        @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0)";
            await connection.ExecuteAsync(quoteSql, entity, transaction);

            // Insert items
            if (items.Any())
            {
                var itemSql = @"
                    INSERT INTO QuoteItems (QuoteItemID, QuoteID, ItemOrder, ItemName, ItemDescription,
                                            Quantity, Unit, UnitPrice, DiscountPercent, Amount)
                    VALUES (@QuoteItemID, @QuoteID, @ItemOrder, @ItemName, @ItemDescription,
                            @Quantity, @Unit, @UnitPrice, @DiscountPercent, @Amount)";
                await connection.ExecuteAsync(itemSql, items, transaction);
            }

            transaction.Commit();
            return entity;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<Quote> UpdateAsync(string siteId, Guid id, Quote entity, List<QuoteItem> items)
    {
        using var connection = GetConnection();
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Update quote
            var quoteSql = @"
                UPDATE Quotes
                SET DealID = @DealID, CustomerID = @CustomerID, ContactID = @ContactID,
                    QuoteName = @QuoteName, QuoteDate = @QuoteDate, ValidUntil = @ValidUntil,
                    SubTotal = @SubTotal, DiscountPercent = @DiscountPercent, DiscountAmount = @DiscountAmount,
                    TaxPercent = @TaxPercent, TaxAmount = @TaxAmount, TotalAmount = @TotalAmount, Currency = @Currency,
                    Status = @Status, PaymentTerms = @PaymentTerms, DeliveryTerms = @DeliveryTerms, Notes = @Notes,
                    UpdatedAt = GETUTCDATE()
                WHERE SiteID = @SiteID AND QuoteID = @QuoteID AND IsDeleted = 0";

            var parameters = new
            {
                SiteID = siteId,
                QuoteID = id,
                entity.DealID,
                entity.CustomerID,
                entity.ContactID,
                entity.QuoteName,
                entity.QuoteDate,
                entity.ValidUntil,
                entity.SubTotal,
                entity.DiscountPercent,
                entity.DiscountAmount,
                entity.TaxPercent,
                entity.TaxAmount,
                entity.TotalAmount,
                entity.Currency,
                entity.Status,
                entity.PaymentTerms,
                entity.DeliveryTerms,
                entity.Notes
            };
            await connection.ExecuteAsync(quoteSql, parameters, transaction);

            // Delete existing items
            var deleteItemsSql = "DELETE FROM QuoteItems WHERE QuoteID = @QuoteID";
            await connection.ExecuteAsync(deleteItemsSql, new { QuoteID = id }, transaction);

            // Insert new items
            if (items.Any())
            {
                var itemSql = @"
                    INSERT INTO QuoteItems (QuoteItemID, QuoteID, ItemOrder, ItemName, ItemDescription,
                                            Quantity, Unit, UnitPrice, DiscountPercent, Amount)
                    VALUES (@QuoteItemID, @QuoteID, @ItemOrder, @ItemName, @ItemDescription,
                            @Quantity, @Unit, @UnitPrice, @DiscountPercent, @Amount)";
                await connection.ExecuteAsync(itemSql, items, transaction);
            }

            transaction.Commit();
            return entity;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string siteId, Guid id)
    {
        using var connection = GetConnection();
        var sql = @"
            UPDATE Quotes
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            WHERE SiteID = @SiteID AND QuoteID = @QuoteID AND IsDeleted = 0";
        var result = await connection.ExecuteAsync(sql, new { SiteID = siteId, QuoteID = id });
        return result > 0;
    }

    public async Task<IEnumerable<QuoteDTO>> SearchAsync(string siteId, QuoteSearchDTO searchDTO)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT q.QuoteID, q.SiteID, q.DealID, d.DealName,
                   q.CustomerID, cu.CustomerName,
                   q.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   q.QuoteNumber, q.QuoteName, q.Version,
                   q.QuoteDate, q.ValidUntil,
                   q.SubTotal, q.DiscountPercent, q.DiscountAmount,
                   q.TaxPercent, q.TaxAmount, q.TotalAmount, q.Currency,
                   q.Status, q.PaymentTerms, q.DeliveryTerms, q.Notes,
                   q.CreatedAt, q.UpdatedAt
            FROM Quotes q
            INNER JOIN Deals d ON q.DealID = d.DealID
            INNER JOIN Customers cu ON q.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON q.ContactID = c.ContactID
            WHERE q.SiteID = @SiteID AND q.IsDeleted = 0
                AND (@SearchTerm IS NULL OR q.QuoteNumber LIKE '%' + @SearchTerm + '%' OR q.QuoteName LIKE '%' + @SearchTerm + '%')
                AND (@DealID IS NULL OR q.DealID = @DealID)
                AND (@CustomerID IS NULL OR q.CustomerID = @CustomerID)
                AND (@Status IS NULL OR q.Status = @Status)
            ORDER BY q.CreatedAt DESC
            OFFSET (@PageNumber - 1) * @PageSize ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        var quotes = (await connection.QueryAsync<QuoteDTO>(sql, searchDTO)).ToList();

        // Load items for each quote
        foreach (var quote in quotes)
        {
            quote.Items = (await GetQuoteItemsAsync(connection, quote.QuoteID)).ToList();
        }

        return quotes;
    }

    public async Task<IEnumerable<QuoteDTO>> GetByDealIdAsync(string siteId, Guid dealId)
    {
        using var connection = GetConnection();
        var sql = @"
            SELECT q.QuoteID, q.SiteID, q.DealID, d.DealName,
                   q.CustomerID, cu.CustomerName,
                   q.ContactID, CONCAT(c.FirstName, ' ', c.LastName) as ContactName,
                   q.QuoteNumber, q.QuoteName, q.Version,
                   q.QuoteDate, q.ValidUntil,
                   q.SubTotal, q.DiscountPercent, q.DiscountAmount,
                   q.TaxPercent, q.TaxAmount, q.TotalAmount, q.Currency,
                   q.Status, q.PaymentTerms, q.DeliveryTerms, q.Notes,
                   q.CreatedAt, q.UpdatedAt
            FROM Quotes q
            INNER JOIN Deals d ON q.DealID = d.DealID
            INNER JOIN Customers cu ON q.CustomerID = cu.CustomerID
            LEFT JOIN Contacts c ON q.ContactID = c.ContactID
            WHERE q.SiteID = @SiteID AND q.DealID = @DealID AND q.IsDeleted = 0
            ORDER BY q.Version DESC, q.CreatedAt DESC";

        var quotes = (await connection.QueryAsync<QuoteDTO>(sql, new { SiteID = siteId, DealID = dealId })).ToList();

        // Load items for each quote
        foreach (var quote in quotes)
        {
            quote.Items = (await GetQuoteItemsAsync(connection, quote.QuoteID)).ToList();
        }

        return quotes;
    }
}