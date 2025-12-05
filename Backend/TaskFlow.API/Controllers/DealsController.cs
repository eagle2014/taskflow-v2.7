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
public class DealsController : ApiControllerBase
{
    private readonly IDealRepository _repository;
    private readonly ILogger<DealsController> _logger;
    private const string DefaultSiteId = "T0001"; // Default for anonymous/testing

    public DealsController(IDealRepository repository, ILogger<DealsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    private string GetSiteIdOrDefault()
    {
        try
        {
            return GetSiteId();
        }
        catch
        {
            return DefaultSiteId;
        }
    }

    private Guid GetUserIdOrDefault()
    {
        try
        {
            return GetUserId();
        }
        catch
        {
            return Guid.Empty;
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<DealDTO>>>> GetAll()
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var deals = await _repository.GetAllAsync(siteId);
            return Success(deals, "Deals retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving deals");
            return StatusCode(500, ApiResponse<IEnumerable<DealDTO>>.ErrorResponse("Error retrieving deals"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DealDTO>>> GetById(Guid id)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var deal = await _repository.GetByIdAsync(siteId, id);

            if (deal == null)
                return NotFound(ApiResponse<DealDTO>.ErrorResponse("Deal not found"));

            return Success(deal, "Deal retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving deal {DealId}", id);
            return StatusCode(500, ApiResponse<DealDTO>.ErrorResponse("Error retrieving deal"));
        }
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DealDTO>>>> GetByCustomer(Guid customerId)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var deals = await _repository.GetByCustomerIdAsync(siteId, customerId);
            return Success(deals, "Customer deals retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving deals for customer {CustomerId}", customerId);
            return StatusCode(500, ApiResponse<IEnumerable<DealDTO>>.ErrorResponse("Error retrieving deals"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DealDTO>>> Create([FromBody] CreateDealDTO dto)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var userId = GetUserIdOrDefault();

            var entity = new Deal
            {
                DealID = Guid.NewGuid(),
                SiteID = siteId,
                CustomerID = dto.CustomerID,
                ContactID = dto.ContactID,
                DealCode = dto.DealCode,
                DealName = dto.DealName,
                Description = dto.Description,
                DealValue = dto.DealValue,
                Currency = dto.Currency,
                Stage = dto.Stage,
                Probability = dto.Probability,
                ExpectedCloseDate = dto.ExpectedCloseDate,
                Status = dto.Status,
                OwnerID = dto.OwnerID ?? userId,
                Source = dto.Source,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.CreateAsync(entity);
            var created = await _repository.GetByIdAsync(siteId, entity.DealID);

            return CreatedAtAction(nameof(GetById), new { id = entity.DealID }, Success(created, "Deal created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating deal");
            return StatusCode(500, ApiResponse<DealDTO>.ErrorResponse("Error creating deal"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DealDTO>>> Update(Guid id, [FromBody] UpdateDealDTO dto)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<DealDTO>.ErrorResponse("Deal not found"));

            var entity = new Deal
            {
                CustomerID = dto.CustomerID,
                ContactID = dto.ContactID,
                DealName = dto.DealName,
                Description = dto.Description,
                DealValue = dto.DealValue,
                Currency = dto.Currency,
                Stage = dto.Stage,
                Probability = dto.Probability,
                ExpectedCloseDate = dto.ExpectedCloseDate,
                ActualCloseDate = dto.ActualCloseDate,
                Status = dto.Status,
                LostReason = dto.LostReason,
                OwnerID = dto.OwnerID,
                Source = dto.Source
            };

            await _repository.UpdateAsync(siteId, id, entity);
            var updated = await _repository.GetByIdAsync(siteId, id);

            return Success(updated, "Deal updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating deal {DealId}", id);
            return StatusCode(500, ApiResponse<DealDTO>.ErrorResponse("Error updating deal"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<bool>.ErrorResponse("Deal not found"));

            var result = await _repository.DeleteAsync(siteId, id);
            return Success(result, "Deal deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting deal {DealId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse("Error deleting deal"));
        }
    }

    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DealDTO>>>> Search([FromBody] DealSearchDTO searchDTO)
    {
        try
        {
            var siteId = GetSiteIdOrDefault();
            var deals = await _repository.SearchAsync(siteId, searchDTO);
            return Success(deals, "Search completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching deals");
            return StatusCode(500, ApiResponse<IEnumerable<DealDTO>>.ErrorResponse("Error searching deals"));
        }
    }
}