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
public class ContactsController : ApiControllerBase
{
    private readonly IContactRepository _repository;
    private readonly ILogger<ContactsController> _logger;

    public ContactsController(IContactRepository repository, ILogger<ContactsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ContactDTO>>>> GetAll()
    {
        try
        {
            var siteId = GetSiteId();
            var contacts = await _repository.GetAllAsync(siteId);
            return Success(contacts, "Contacts retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contacts");
            return StatusCode(500, ApiResponse<IEnumerable<ContactDTO>>.ErrorResponse("Error retrieving contacts"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ContactDTO>>> GetById(Guid id)
    {
        try
        {
            var siteId = GetSiteId();
            var contact = await _repository.GetByIdAsync(siteId, id);

            if (contact == null)
                return NotFound(ApiResponse<ContactDTO>.ErrorResponse("Contact not found"));

            return Success(contact, "Contact retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact {ContactId}", id);
            return StatusCode(500, ApiResponse<ContactDTO>.ErrorResponse("Error retrieving contact"));
        }
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ContactDTO>>>> GetByCustomer(Guid customerId)
    {
        try
        {
            var siteId = GetSiteId();
            var contacts = await _repository.GetByCustomerIdAsync(siteId, customerId);
            return Success(contacts, "Customer contacts retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contacts for customer {CustomerId}", customerId);
            return StatusCode(500, ApiResponse<IEnumerable<ContactDTO>>.ErrorResponse("Error retrieving contacts"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ContactDTO>>> Create([FromBody] CreateContactDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var userId = GetUserId();

            var entity = new Contact
            {
                ContactID = Guid.NewGuid(),
                SiteID = siteId,
                CustomerID = dto.CustomerID,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Mobile = dto.Mobile,
                Position = dto.Position,
                Department = dto.Department,
                IsPrimary = dto.IsPrimary,
                Status = dto.Status,
                LinkedIn = dto.LinkedIn,
                Notes = dto.Notes,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repository.CreateAsync(entity);
            var created = await _repository.GetByIdAsync(siteId, entity.ContactID);

            return CreatedAtAction(nameof(GetById), new { id = entity.ContactID }, Success(created, "Contact created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating contact");
            return StatusCode(500, ApiResponse<ContactDTO>.ErrorResponse("Error creating contact"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ContactDTO>>> Update(Guid id, [FromBody] UpdateContactDTO dto)
    {
        try
        {
            var siteId = GetSiteId();
            var existing = await _repository.GetByIdAsync(siteId, id);

            if (existing == null)
                return NotFound(ApiResponse<ContactDTO>.ErrorResponse("Contact not found"));

            var entity = new Contact
            {
                CustomerID = dto.CustomerID,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Mobile = dto.Mobile,
                Position = dto.Position,
                Department = dto.Department,
                IsPrimary = dto.IsPrimary,
                Status = dto.Status,
                LinkedIn = dto.LinkedIn,
                Notes = dto.Notes
            };

            await _repository.UpdateAsync(siteId, id, entity);
            var updated = await _repository.GetByIdAsync(siteId, id);

            return Success(updated, "Contact updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating contact {ContactId}", id);
            return StatusCode(500, ApiResponse<ContactDTO>.ErrorResponse("Error updating contact"));
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
                return NotFound(ApiResponse<bool>.ErrorResponse("Contact not found"));

            var result = await _repository.DeleteAsync(siteId, id);
            return Success(result, "Contact deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting contact {ContactId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse("Error deleting contact"));
        }
    }

    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ContactDTO>>>> Search([FromBody] ContactSearchDTO searchDTO)
    {
        try
        {
            var siteId = GetSiteId();
            var contacts = await _repository.SearchAsync(siteId, searchDTO);
            return Success(contacts, "Search completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching contacts");
            return StatusCode(500, ApiResponse<IEnumerable<ContactDTO>>.ErrorResponse("Error searching contacts"));
        }
    }
}