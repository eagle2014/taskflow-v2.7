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
        /// <returns>List of projects</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetAllAsync(siteId);

                var projectDtos = projects.Select(p => new ProjectDto
                {
                    ProjectID = p.ProjectID,
                    SiteID = p.SiteID,
                    Name = p.Name,
                    Description = p.Description,
                    CategoryID = p.CategoryID,
                    Status = p.Status,
                    Priority = p.Priority,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    CreatedBy = p.CreatedBy,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                });

                return Success(projectDtos, "Projects retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects");
                return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
            }
        }

        /// <summary>
        /// Get project by ID
        /// </summary>
        /// <param name="id">Project ID</param>
        /// <returns>Project details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var project = await _projectRepository.GetByIdAsync(siteId, id);

                if (project == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResponse("Project not found"));
                }

                var projectDto = new ProjectDto
                {
                    ProjectID = project.ProjectID,
                    SiteID = project.SiteID,
                    Name = project.Name,
                    Description = project.Description,
                    CategoryID = project.CategoryID,
                    Status = project.Status,
                    Priority = project.Priority,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    CreatedBy = project.CreatedBy,
                    CreatedAt = project.CreatedAt,
                    UpdatedAt = project.UpdatedAt
                };

                return Success(projectDto, "Project retrieved successfully");
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
        /// <param name="createDto">Project creation data</param>
        /// <returns>Created project</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> Create([FromBody] CreateProjectDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var project = new Project
                {
                    ProjectID = Guid.NewGuid(),
                    SiteID = siteId,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CategoryID = createDto.CategoryID,
                    Status = createDto.Status ?? "Active",
                    Priority = createDto.Priority ?? "Medium",
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdProject = await _projectRepository.AddAsync(project);

                var projectDto = new ProjectDto
                {
                    ProjectID = createdProject.ProjectID,
                    SiteID = createdProject.SiteID,
                    Name = createdProject.Name,
                    Description = createdProject.Description,
                    CategoryID = createdProject.CategoryID,
                    Status = createdProject.Status,
                    Priority = createdProject.Priority,
                    StartDate = createdProject.StartDate,
                    EndDate = createdProject.EndDate,
                    CreatedBy = createdProject.CreatedBy,
                    CreatedAt = createdProject.CreatedAt,
                    UpdatedAt = createdProject.UpdatedAt
                };

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = projectDto.ProjectID },
                    ApiResponse<ProjectDto>.SuccessResponse(projectDto, "Project created successfully")
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
        /// <param name="id">Project ID</param>
        /// <param name="updateDto">Project update data</param>
        /// <returns>Updated project</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> Update(Guid id, [FromBody] UpdateProjectDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingProject = await _projectRepository.GetByIdAsync(siteId, id);

                if (existingProject == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResponse("Project not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Name))
                    existingProject.Name = updateDto.Name;

                if (updateDto.Description != null)
                    existingProject.Description = updateDto.Description;

                if (updateDto.CategoryID.HasValue)
                    existingProject.CategoryID = updateDto.CategoryID.Value;

                if (!string.IsNullOrEmpty(updateDto.Status))
                    existingProject.Status = updateDto.Status;

                if (!string.IsNullOrEmpty(updateDto.Priority))
                    existingProject.Priority = updateDto.Priority;

                if (updateDto.StartDate.HasValue)
                    existingProject.StartDate = updateDto.StartDate;

                if (updateDto.EndDate.HasValue)
                    existingProject.EndDate = updateDto.EndDate;

                existingProject.UpdatedAt = DateTime.UtcNow;

                var updatedProject = await _projectRepository.UpdateAsync(siteId, id, existingProject);

                var projectDto = new ProjectDto
                {
                    ProjectID = updatedProject.ProjectID,
                    SiteID = updatedProject.SiteID,
                    Name = updatedProject.Name,
                    Description = updatedProject.Description,
                    CategoryID = updatedProject.CategoryID,
                    Status = updatedProject.Status,
                    Priority = updatedProject.Priority,
                    StartDate = updatedProject.StartDate,
                    EndDate = updatedProject.EndDate,
                    CreatedBy = updatedProject.CreatedBy,
                    CreatedAt = updatedProject.CreatedAt,
                    UpdatedAt = updatedProject.UpdatedAt
                };

                return Success(projectDto, "Project updated successfully");
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
        /// <param name="id">Project ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
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
        /// <param name="categoryId">Category ID</param>
        /// <returns>List of projects in category</returns>
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetByCategory(Guid categoryId)
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetByCategoryAsync(siteId, categoryId);

                var projectDtos = projects.Select(p => new ProjectDto
                {
                    ProjectID = p.ProjectID,
                    SiteID = p.SiteID,
                    Name = p.Name,
                    Description = p.Description,
                    CategoryID = p.CategoryID,
                    Status = p.Status,
                    Priority = p.Priority,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    CreatedBy = p.CreatedBy,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                });

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
        /// <param name="status">Project status</param>
        /// <returns>List of projects with specified status</returns>
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetByStatus(string status)
        {
            try
            {
                var siteId = GetSiteId();
                var projects = await _projectRepository.GetByStatusAsync(siteId, status);

                var projectDtos = projects.Select(p => new ProjectDto
                {
                    ProjectID = p.ProjectID,
                    SiteID = p.SiteID,
                    Name = p.Name,
                    Description = p.Description,
                    CategoryID = p.CategoryID,
                    Status = p.Status,
                    Priority = p.Priority,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    CreatedBy = p.CreatedBy,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                });

                return Success(projectDtos, "Projects retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects with status {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
            }
        }
    }
}
