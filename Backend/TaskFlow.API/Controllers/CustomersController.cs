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
public class CustomersController : ApiControllerBase
{
    private readonly ICustomerRepository _repository;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(ICustomerRepository repository, ILogger<CustomersController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CustomerDTO>>>> GetAll()
    {
        try
        {
            var siteId = GetSiteId();
            var customers = await _repository.GetAllAsync(siteId);
            return Success(customers, "Customers retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customers");
            return StatusCode(500, ApiResponse<IEnumerable<CustomerDTO>>.ErrorResponse("Error retrieving customers"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CustomerDTO>>> GetById(Guid id)
    {
        try
        {
            var siteId = GetSiteId();
            var customer = await _repository.GetByIdAsync(siteId, id);

            if (customer == null)
                return NotFound(ApiResponse<CustomerDTO>.ErrorResponse("Customer not found"));

            return Success(customer, "Customer retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer {CustomerId}", id);
            return StatusCode(500, ApiResponse<CustomerDTO>.ErrorResponse("Error retrieving customer"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CustomerDTO>>> Create([FromBody] CreateCustomerDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var userId = GetUserId();

            var entity = new Customer
            {
                CustomerID = Guid.NewGuid(),
                SiteID = siteId,
                CustomerCode = dto.CustomerCode,
                CustomerName = dto.CustomerName,
                CustomerType = dto.CustomerType,
                Industry = dto.Industry,
                Website = dto.Website,
                TaxCode = dto.TaxCode,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                AnnualRevenue = dto.AnnualRevenue,
                EmployeeCount = dto.EmployeeCount,
                Status = dto.Status,
                Source = dto.Source,
                Notes = dto.Notes,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.CreateAsync(entity);
            var created = await _repository.GetByIdAsync(siteId, entity.CustomerID);

            return CreatedAtAction(nameof(GetById), new { id = entity.CustomerID }, Success(created, "Customer created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating customer");
            return StatusCode(500, ApiResponse<CustomerDTO>.ErrorResponse("Error creating customer"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CustomerDTO>>> Update(Guid id, [FromBody] UpdateCustomerDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<CustomerDTO>.ErrorResponse("Customer not found"));

            var entity = new Customer
            {
                CustomerName = dto.CustomerName,
                CustomerType = dto.CustomerType,
                Industry = dto.Industry,
                Website = dto.Website,
                TaxCode = dto.TaxCode,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                AnnualRevenue = dto.AnnualRevenue,
                EmployeeCount = dto.EmployeeCount,
                Status = dto.Status,
                Source = dto.Source,
                Notes = dto.Notes
            };

            await _repository.UpdateAsync(siteId, id, entity);
            var updated = await _repository.GetByIdAsync(siteId, id);

            return Success(updated, "Customer updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating customer {CustomerId}", id);
            return StatusCode(500, ApiResponse<CustomerDTO>.ErrorResponse("Error updating customer"));
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
                return NotFound(ApiResponse<bool>.ErrorResponse("Customer not found"));

            var result = await _repository.DeleteAsync(siteId, id);
            return Success(result, "Customer deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting customer {CustomerId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse("Error deleting customer"));
        }
    }

    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CustomerDTO>>>> Search([FromBody] CustomerSearchDTO searchDTO)
    {
        try
        {
            var siteId = GetSiteId();
            var customers = await _repository.SearchAsync(siteId, searchDTO);
            return Success(customers, "Search completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching customers");
            return StatusCode(500, ApiResponse<IEnumerable<CustomerDTO>>.ErrorResponse("Error searching customers"));
        }
    }
}