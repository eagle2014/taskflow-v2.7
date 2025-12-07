using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.DTOs.Project;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Projects management endpoints with multi-tenant support
    /// ProjectID is human-readable code (e.g., "PRJ-0001"), RowPointer is internal GUID
    /// </summary>
    public class ProjectsController : ApiControllerBase
    {
        private readonly IProjectRepository _projectRepository;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(
            IProjectRepository projectRepository,
            ILogger<ProjectsController> logger)
        {
            _projectRepository = projectRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all projects for current tenant
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetAllAsync(siteId);

                var projectDtos = projects.Select(p => MapToDto(p));

                return Success(projectDtos, "Projects retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects");
                return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
            }
        }

        /// <summary>
        /// Get project by ProjectID (human-readable code like "PRJ-0001")
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(string id)
        {
            try
            {
                var siteId = GetSiteId();
                var project = await _projectRepository.GetByIdAsync(siteId, id);

                if (project == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResponse("Project not found"));
                }

                return Success(MapToDto(project), "Project retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResponse("Error retrieving project"));
            }
        }

        /// <summary>
        /// Create new project
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> Create([FromBody] CreateProjectDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var project = new Project
                {
                    RowPointer = Guid.NewGuid(),
                    SiteID = siteId,
                    ProjectID = createDto.ProjectID ?? string.Empty, // Will be auto-generated if empty
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CategoryID = createDto.CategoryID,
                    Status = createDto.Status ?? "Active",
                    Priority = createDto.Priority ?? "Medium",
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    AssigneeID = createDto.AssigneeID,
                    CustomerID = createDto.CustomerID,
                    ContactID = createDto.ContactID,
                    DealID = createDto.DealID,
                    ActualEndDate = createDto.ActualEndDate,
                    ProjectUrl = createDto.ProjectUrl,
                    Progress = createDto.Progress,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdProject = await _projectRepository.AddAsync(project);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = createdProject.ProjectID },
                    ApiResponse<ProjectDto>.SuccessResponse(MapToDto(createdProject), "Project created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResponse("Error creating project"));
            }
        }

        /// <summary>
        /// Update existing project
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> Update(string id, [FromBody] UpdateProjectDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingProject = await _projectRepository.GetByIdAsync(siteId, id);

                if (existingProject == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResponse("Project not found"));
                }

                // Apply updates (ProjectID cannot be changed)
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingProject.Name = updateDto.Name;

                if (updateDto.Description != null)
                    existingProject.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.CategoryID))
                    existingProject.CategoryID = updateDto.CategoryID;

                if (!string.IsNullOrEmpty(updateDto.Status))
                    existingProject.Status = updateDto.Status;

                if (!string.IsNullOrEmpty(updateDto.Priority))
                    existingProject.Priority = updateDto.Priority;

                if (updateDto.StartDate.HasValue)
                    existingProject.StartDate = updateDto.StartDate;

                if (updateDto.EndDate.HasValue)
                    existingProject.EndDate = updateDto.EndDate;

                if (updateDto.AssigneeID.HasValue)
                    existingProject.AssigneeID = updateDto.AssigneeID;

                if (updateDto.CustomerID.HasValue)
                    existingProject.CustomerID = updateDto.CustomerID;

                if (updateDto.ContactID.HasValue)
                    existingProject.ContactID = updateDto.ContactID;

                if (updateDto.DealID.HasValue)
                    existingProject.DealID = updateDto.DealID;

                if (updateDto.ActualEndDate.HasValue)
                    existingProject.ActualEndDate = updateDto.ActualEndDate;

                if (!string.IsNullOrEmpty(updateDto.ProjectUrl))
                    existingProject.ProjectUrl = updateDto.ProjectUrl;

                if (updateDto.Progress.HasValue)
                    existingProject.Progress = updateDto.Progress.Value;

                existingProject.UpdatedAt = DateTime.UtcNow;

                var updatedProject = await _projectRepository.UpdateAsync(siteId, id, existingProject);

                return Success(MapToDto(updatedProject), "Project updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {ProjectId}", id);
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResponse("Error updating project"));
            }
        }

        /// <summary>
        /// Delete project (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(string id)
        {
            try
            {
                var siteId = GetSiteId();
                var project = await _projectRepository.GetByIdAsync(siteId, id);

                if (project == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Project not found"));
                }

                await _projectRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Project deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project {ProjectId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting project"));
            }
        }

        /// <summary>
        /// Get projects by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetByCategory(string categoryId)
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetByCategoryAsync(siteId, categoryId);

                var projectDtos = projects.Select(p => MapToDto(p));

                return Success(projectDtos, "Projects retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects for category {CategoryId}", categoryId);
                return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
            }
        }

        /// <summary>
        /// Get projects by status
        /// </summary>
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetByStatus(string status)
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetByStatusAsync(siteId, status);

                var projectDtos = projects.Select(p => MapToDto(p));

                return Success(projectDtos, "Projects retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects with status {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
            }
        }

        /// <summary>
        /// Map Project entity to ProjectDto
        /// </summary>
        private static ProjectDto MapToDto(Project p) => new()
        {
            RowPointer = p.RowPointer,
            SiteID = p.SiteID,
            ProjectID = p.ProjectID,
            Name = p.Name,
            Description = p.Description,
            CategoryID = p.CategoryID,
            Status = p.Status,
            Priority = p.Priority,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            AssigneeID = p.AssigneeID,
            CustomerID = p.CustomerID,
            ContactID = p.ContactID,
            DealID = p.DealID,
            ActualEndDate = p.ActualEndDate,
            ProjectUrl = p.ProjectUrl,
            Progress = p.Progress,
            CreatedBy = p.CreatedBy,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}