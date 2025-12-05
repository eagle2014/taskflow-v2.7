using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class QuotesController : ApiControllerBase
{
    private readonly IQuoteRepository _repository;
    private readonly ILogger<QuotesController> _logger;

    public QuotesController(IQuoteRepository repository, ILogger<QuotesController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuoteDTO>>>> GetAll()
    {
        try
        {
            var siteId = GetSiteId();
            var quotes = await _repository.GetAllAsync(siteId);
            return Success(quotes, "Quotes retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quotes");
            return StatusCode(500, ApiResponse<IEnumerable<QuoteDTO>>.ErrorResponse("Error retrieving quotes"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<QuoteDTO>>> GetById(Guid id)
    {
        try
        {
            var siteId = GetSiteId();
            var quote = await _repository.GetByIdAsync(siteId, id);

            if (quote == null)
                return NotFound(ApiResponse<QuoteDTO>.ErrorResponse("Quote not found"));

            return Success(quote, "Quote retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quote {QuoteId}", id);
            return StatusCode(500, ApiResponse<QuoteDTO>.ErrorResponse("Error retrieving quote"));
        }
    }

    [HttpGet("deal/{dealId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuoteDTO>>>> GetByDeal(Guid dealId)
    {
        try
        {
            var siteId = GetSiteId();
            var quotes = await _repository.GetByDealIdAsync(siteId, dealId);
            return Success(quotes, "Deal quotes retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quotes for deal {DealId}", dealId);
            return StatusCode(500, ApiResponse<IEnumerable<QuoteDTO>>.ErrorResponse("Error retrieving quotes"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<QuoteDTO>>> Create([FromBody] CreateQuoteDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var userId = GetUserId();

            // Calculate totals
            var subTotal = dto.Items.Sum(i => CalculateItemAmount(i));
            var discountAmount = subTotal * (dto.DiscountPercent / 100);
            var taxableAmount = subTotal - discountAmount;
            var taxAmount = taxableAmount * (dto.TaxPercent / 100);
            var totalAmount = taxableAmount + taxAmount;

            var entity = new Quote
            {
                QuoteID = Guid.NewGuid(),
                SiteID = siteId,
                DealID = dto.DealID,
                CustomerID = dto.CustomerID,
                ContactID = dto.ContactID,
                QuoteNumber = dto.QuoteNumber,
                QuoteName = dto.QuoteName,
                Version = 1,
                QuoteDate = dto.QuoteDate,
                ValidUntil = dto.ValidUntil,
                SubTotal = subTotal,
                DiscountPercent = dto.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxPercent = dto.TaxPercent,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                Currency = dto.Currency,
                Status = dto.Status,
                PaymentTerms = dto.PaymentTerms,
                DeliveryTerms = dto.DeliveryTerms,
                Notes = dto.Notes,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var items = dto.Items.Select(i => new QuoteItem
            {
                QuoteItemID = Guid.NewGuid(),
                QuoteID = entity.QuoteID,
                ItemOrder = i.ItemOrder,
                ItemName = i.ItemName,
                ItemDescription = i.ItemDescription,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                DiscountPercent = i.DiscountPercent,
                Amount = CalculateItemAmount(i)
            }).ToList();

            await _repository.CreateAsync(entity, items);
            var created = await _repository.GetByIdAsync(siteId, entity.QuoteID);

            return CreatedAtAction(nameof(GetById), new { id = entity.QuoteID }, Success(created, "Quote created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quote");
            return StatusCode(500, ApiResponse<QuoteDTO>.ErrorResponse("Error creating quote"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<QuoteDTO>>> Update(Guid id, [FromBody] UpdateQuoteDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<QuoteDTO>.ErrorResponse("Quote not found"));

            // Calculate totals
            var subTotal = dto.Items.Sum(i => CalculateItemAmount(i));
            var discountAmount = subTotal * (dto.DiscountPercent / 100);
            var taxableAmount = subTotal - discountAmount;
            var taxAmount = taxableAmount * (dto.TaxPercent / 100);
            var totalAmount = taxableAmount + taxAmount;

            var entity = new Quote
            {
                DealID = dto.DealID,
                CustomerID = dto.CustomerID,
                ContactID = dto.ContactID,
                QuoteName = dto.QuoteName,
                QuoteDate = dto.QuoteDate,
                ValidUntil = dto.ValidUntil,
                SubTotal = subTotal,
                DiscountPercent = dto.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxPercent = dto.TaxPercent,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                Currency = dto.Currency,
                Status = dto.Status,
                PaymentTerms = dto.PaymentTerms,
                DeliveryTerms = dto.DeliveryTerms,
                Notes = dto.Notes
            };

            var items = dto.Items.Select(i => new QuoteItem
            {
                QuoteItemID = Guid.NewGuid(),
                QuoteID = id,
                ItemOrder = i.ItemOrder,
                ItemName = i.ItemName,
                ItemDescription = i.ItemDescription,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                DiscountPercent = i.DiscountPercent,
                Amount = CalculateItemAmount(i)
            }).ToList();

            await _repository.UpdateAsync(siteId, id, entity, items);
            var updated = await _repository.GetByIdAsync(siteId, id);

            return Success(updated, "Quote updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating quote {QuoteId}", id);
            return StatusCode(500, ApiResponse<QuoteDTO>.ErrorResponse("Error updating quote"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        try
        {
            var siteId = GetSiteId();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<bool>.ErrorResponse("Quote not found"));

            var result = await _repository.DeleteAsync(siteId, id);
            return Success(result, "Quote deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting quote {QuoteId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse("Error deleting quote"));
        }
    }

    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuoteDTO>>>> Search([FromBody] QuoteSearchDTO searchDTO)
    {
        try
        {
            var siteId = GetSiteId();
            var quotes = await _repository.SearchAsync(siteId, searchDTO);
            return Success(quotes, "Search completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching quotes");
            return StatusCode(500, ApiResponse<IEnumerable<QuoteDTO>>.ErrorResponse("Error searching quotes"));
        }
    }

    private decimal CalculateItemAmount(CreateQuoteItemDTO item)
    {
        var amount = item.Quantity * item.UnitPrice;
        var discount = amount * (item.DiscountPercent / 100);
        return amount - discount;
    }
}