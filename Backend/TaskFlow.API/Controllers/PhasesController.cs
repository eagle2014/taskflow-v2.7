using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.DTOs.Phase;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Project phases management endpoints with multi-tenant support
    /// </summary>
    public class PhasesController : ApiControllerBase
    {
        private readonly IPhaseRepository _phaseRepository;
        private readonly ILogger<PhasesController> _logger;

        public PhasesController(
            IPhaseRepository phaseRepository,
            ILogger<PhasesController> logger)
        {
            _phaseRepository = phaseRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all phases for a project
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <returns>List of phases</returns>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<PhaseDto>>>> GetByProject(Guid projectId)
        {
            try
            {
                var siteId = GetSiteId();
                var phases = await _phaseRepository.GetByProjectAsync(siteId, projectId);

                var phaseDtos = phases.Select(MapToDto);

                return Success(phaseDtos, "Phases retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving phases for project {ProjectId}", projectId);
                return StatusCode(500, ApiResponse<IEnumerable<PhaseDto>>.ErrorResponse("Error retrieving phases"));
            }
        }

        /// <summary>
        /// Get phase by ID
        /// </summary>
        /// <param name="id">Phase ID</param>
        /// <returns>Phase details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PhaseDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var phase = await _phaseRepository.GetByIdAsync(siteId, id);

                if (phase == null)
                {
                    return NotFound(ApiResponse<PhaseDto>.ErrorResponse("Phase not found"));
                }

                var phaseDto = MapToDto(phase);

                return Success(phaseDto, "Phase retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving phase {PhaseId}", id);
                return StatusCode(500, ApiResponse<PhaseDto>.ErrorResponse("Error retrieving phase"));
            }
        }

        /// <summary>
        /// Create new phase
        /// </summary>
        /// <param name="createDto">Phase creation data</param>
        /// <returns>Created phase</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<PhaseDto>>> Create([FromBody] CreatePhaseDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var phase = new Phase
                {
                    PhaseID = Guid.NewGuid(),
                    SiteID = siteId,
                    ProjectID = createDto.ProjectID,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Color = createDto.Color ?? "#3B82F6",
                    Order = createDto.Order ?? 0,
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdPhase = await _phaseRepository.AddAsync(phase);
                var phaseDto = MapToDto(createdPhase);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = phaseDto.PhaseID },
                    ApiResponse<PhaseDto>.SuccessResponse(phaseDto, "Phase created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating phase");
                return StatusCode(500, ApiResponse<PhaseDto>.ErrorResponse("Error creating phase"));
            }
        }

        /// <summary>
        /// Update existing phase
        /// </summary>
        /// <param name="id">Phase ID</param>
        /// <param name="updateDto">Phase update data</param>
        /// <returns>Updated phase</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<PhaseDto>>> Update(Guid id, [FromBody] UpdatePhaseDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingPhase = await _phaseRepository.GetByIdAsync(siteId, id);

                if (existingPhase == null)
                {
                    return NotFound(ApiResponse<PhaseDto>.ErrorResponse("Phase not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingPhase.Name = updateDto.Name;

                if (updateDto.Description != null)
                    existingPhase.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.Color))
                    existingPhase.Color = updateDto.Color;

                if (updateDto.Order.HasValue)
                    existingPhase.Order = updateDto.Order.Value;

                if (updateDto.StartDate.HasValue)
                    existingPhase.StartDate = updateDto.StartDate;

                if (updateDto.EndDate.HasValue)
                    existingPhase.EndDate = updateDto.EndDate;

                existingPhase.UpdatedAt = DateTime.UtcNow;

                var updatedPhase = await _phaseRepository.UpdateAsync(siteId, id, existingPhase);
                var phaseDto = MapToDto(updatedPhase);

                return Success(phaseDto, "Phase updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating phase {PhaseId}", id);
                return StatusCode(500, ApiResponse<PhaseDto>.ErrorResponse("Error updating phase"));
            }
        }

        /// <summary>
        /// Delete phase (soft delete)
        /// </summary>
        /// <param name="id">Phase ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var phase = await _phaseRepository.GetByIdAsync(siteId, id);

                if (phase == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Phase not found"));
                }

                await _phaseRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Phase deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting phase {PhaseId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting phase"));
            }
        }

        /// <summary>
        /// Reorder phases within a project
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="reorderDto">Reorder data with phase IDs in new order</param>
        /// <returns>Success response</returns>
        [HttpPost("project/{projectId}/reorder")]
        public async Task<ActionResult<ApiResponse<object>>> Reorder(
            Guid projectId,
            [FromBody] ReorderPhasesDto reorderDto)
        {
            try
            {
                var siteId = GetSiteId();

                await _phaseRepository.ReorderAsync(siteId, projectId, reorderDto.PhaseIDs);

                return Success<object>(null, "Phases reordered successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering phases for project {ProjectId}", projectId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error reordering phases"));
            }
        }

        // Helper method to map entity to DTO
        private static PhaseDto MapToDto(Phase phase)
        {
            return new PhaseDto
            {
                PhaseID = phase.PhaseID,
                SiteID = phase.SiteID,
                ProjectID = phase.ProjectID,
                Name = phase.Name,
                Description = phase.Description,
                Color = phase.Color,
                Order = phase.Order,
                StartDate = phase.StartDate,
                EndDate = phase.EndDate,
                CreatedBy = phase.CreatedBy,
                CreatedAt = phase.CreatedAt,
                UpdatedAt = phase.UpdatedAt
            };
        }
    }
}
