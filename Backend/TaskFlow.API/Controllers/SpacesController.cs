using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.DTOs.Space;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Project spaces management endpoints with multi-tenant support
    /// </summary>
    public class SpacesController : ApiControllerBase
    {
        private readonly ISpaceRepository _spaceRepository;
        private readonly ILogger<SpacesController> _logger;

        public SpacesController(
            ISpaceRepository spaceRepository,
            ILogger<SpacesController> logger)
        {
            _spaceRepository = spaceRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all spaces for current tenant
        /// </summary>
        /// <returns>List of spaces</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<SpaceDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var spaces = await _spaceRepository.GetAllAsync(siteId);

                var spaceDtos = spaces.Select(MapToDto);

                return Success(spaceDtos, "Spaces retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving spaces");
                return StatusCode(500, ApiResponse<IEnumerable<SpaceDto>>.ErrorResponse("Error retrieving spaces"));
            }
        }

        /// <summary>
        /// Get space by ID
        /// </summary>
        /// <param name="id">Space ID</param>
        /// <returns>Space details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<SpaceDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var space = await _spaceRepository.GetByIdAsync(siteId, id);

                if (space == null)
                {
                    return NotFound(ApiResponse<SpaceDto>.ErrorResponse("Space not found"));
                }

                var spaceDto = MapToDto(space);

                return Success(spaceDto, "Space retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving space {SpaceId}", id);
                return StatusCode(500, ApiResponse<SpaceDto>.ErrorResponse("Error retrieving space"));
            }
        }

        /// <summary>
        /// Create new space
        /// </summary>
        /// <param name="createDto">Space creation data</param>
        /// <returns>Created space</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<SpaceDto>>> Create([FromBody] CreateSpaceDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var space = new Space
                {
                    SpaceID = Guid.NewGuid(),
                    SiteID = siteId,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Color = createDto.Color ?? "#3B82F6",
                    Icon = createDto.Icon,
                    ProjectIDs = createDto.ProjectIDs ?? string.Empty,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdSpace = await _spaceRepository.AddAsync(space);
                var spaceDto = MapToDto(createdSpace);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = spaceDto.SpaceID },
                    ApiResponse<SpaceDto>.SuccessResponse(spaceDto, "Space created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating space");
                return StatusCode(500, ApiResponse<SpaceDto>.ErrorResponse("Error creating space"));
            }
        }

        /// <summary>
        /// Update existing space
        /// </summary>
        /// <param name="id">Space ID</param>
        /// <param name="updateDto">Space update data</param>
        /// <returns>Updated space</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<SpaceDto>>> Update(Guid id, [FromBody] UpdateSpaceDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingSpace = await _spaceRepository.GetByIdAsync(siteId, id);

                if (existingSpace == null)
                {
                    return NotFound(ApiResponse<SpaceDto>.ErrorResponse("Space not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingSpace.Name = updateDto.Name;

                if (updateDto.Description != null)
                    existingSpace.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.Color))
                    existingSpace.Color = updateDto.Color;

                if (updateDto.Icon != null)
                    existingSpace.Icon = updateDto.Icon;

                if (updateDto.ProjectIDs != null)
                    existingSpace.ProjectIDs = updateDto.ProjectIDs;

                existingSpace.UpdatedAt = DateTime.UtcNow;

                var updatedSpace = await _spaceRepository.UpdateAsync(siteId, id, existingSpace);
                var spaceDto = MapToDto(updatedSpace);

                return Success(spaceDto, "Space updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating space {SpaceId}", id);
                return StatusCode(500, ApiResponse<SpaceDto>.ErrorResponse("Error updating space"));
            }
        }

        /// <summary>
        /// Delete space (soft delete)
        /// </summary>
        /// <param name="id">Space ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var space = await _spaceRepository.GetByIdAsync(siteId, id);

                if (space == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Space not found"));
                }

                await _spaceRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Space deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting space {SpaceId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting space"));
            }
        }

        /// <summary>
        /// Add project to space
        /// </summary>
        /// <param name="spaceId">Space ID</param>
        /// <param name="projectId">Project ID to add</param>
        /// <returns>Updated space</returns>
        [HttpPost("{spaceId}/projects/{projectId}")]
        public async Task<ActionResult<ApiResponse<SpaceDto>>> AddProject(Guid spaceId, Guid projectId)
        {
            try
            {
                var siteId = GetSiteId();
                var space = await _spaceRepository.GetByIdAsync(siteId, spaceId);

                if (space == null)
                {
                    return NotFound(ApiResponse<SpaceDto>.ErrorResponse("Space not found"));
                }

                await _spaceRepository.AddProjectAsync(siteId, spaceId, projectId);

                var updatedSpace = await _spaceRepository.GetByIdAsync(siteId, spaceId);
                var spaceDto = MapToDto(updatedSpace!);

                return Success(spaceDto, "Project added to space successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding project to space");
                return StatusCode(500, ApiResponse<SpaceDto>.ErrorResponse("Error adding project to space"));
            }
        }

        /// <summary>
        /// Remove project from space
        /// </summary>
        /// <param name="spaceId">Space ID</param>
        /// <param name="projectId">Project ID to remove</param>
        /// <returns>Updated space</returns>
        [HttpDelete("{spaceId}/projects/{projectId}")]
        public async Task<ActionResult<ApiResponse<SpaceDto>>> RemoveProject(Guid spaceId, Guid projectId)
        {
            try
            {
                var siteId = GetSiteId();
                var space = await _spaceRepository.GetByIdAsync(siteId, spaceId);

                if (space == null)
                {
                    return NotFound(ApiResponse<SpaceDto>.ErrorResponse("Space not found"));
                }

                await _spaceRepository.RemoveProjectAsync(siteId, spaceId, projectId);

                var updatedSpace = await _spaceRepository.GetByIdAsync(siteId, spaceId);
                var spaceDto = MapToDto(updatedSpace!);

                return Success(spaceDto, "Project removed from space successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing project from space");
                return StatusCode(500, ApiResponse<SpaceDto>.ErrorResponse("Error removing project from space"));
            }
        }

        // Helper method to map entity to DTO
        private static SpaceDto MapToDto(Space space)
        {
            return new SpaceDto
            {
                SpaceID = space.SpaceID,
                SiteID = space.SiteID,
                Name = space.Name,
                Description = space.Description,
                Color = space.Color,
                Icon = space.Icon,
                ProjectIDs = space.ProjectIDs,
                CreatedBy = space.CreatedBy,
                CreatedAt = space.CreatedAt,
                UpdatedAt = space.UpdatedAt
            };
        }
    }
}
