using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.DTOs.Task;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Tasks management endpoints with multi-tenant support
    /// </summary>
    public class TasksController : ApiControllerBase
    {
        private readonly ITaskRepository _taskRepository;
        private readonly ILogger<TasksController> _logger;

        public TasksController(
            ITaskRepository taskRepository,
            ILogger<TasksController> logger)
        {
            _taskRepository = taskRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all tasks for current tenant
        /// </summary>
        /// <returns>List of tasks</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetAllAsync(siteId);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, "Tasks retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving tasks"));
            }
        }

        /// <summary>
        /// Get task by ID
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <returns>Task details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var task = await _taskRepository.GetByIdAsync(siteId, id);

                if (task == null)
                {
                    return NotFound(ApiResponse<TaskDto>.ErrorResponse("Task not found"));
                }

                var taskDto = MapToDto(task);

                return Success(taskDto, "Task retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task {TaskId}", id);
                return StatusCode(500, ApiResponse<TaskDto>.ErrorResponse("Error retrieving task"));
            }
        }

        /// <summary>
        /// Create new task
        /// </summary>
        /// <param name="createDto">Task creation data</param>
        /// <returns>Created task</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskDto>>> Create([FromBody] CreateTaskDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var task = new Models.Entities.Task
                {
                    TaskID = Guid.NewGuid(),
                    SiteID = siteId,
                    ProjectID = createDto.ProjectID,
                    Title = createDto.Title,
                    Description = createDto.Description,
                    Status = createDto.Status ?? "To Do",
                    Priority = createDto.Priority ?? "Medium",
                    AssigneeID = createDto.AssigneeID,
                    DueDate = createDto.DueDate,
                    EstimatedHours = createDto.EstimatedHours,
                    Tags = createDto.Tags,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdTask = await _taskRepository.AddAsync(task);
                var taskDto = MapToDto(createdTask);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = taskDto.TaskID },
                    ApiResponse<TaskDto>.SuccessResponse(taskDto, "Task created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, ApiResponse<TaskDto>.ErrorResponse("Error creating task"));
            }
        }

        /// <summary>
        /// Update existing task
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <param name="updateDto">Task update data</param>
        /// <returns>Updated task</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> Update(Guid id, [FromBody] UpdateTaskDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingTask = await _taskRepository.GetByIdAsync(siteId, id);

                if (existingTask == null)
                {
                    return NotFound(ApiResponse<TaskDto>.ErrorResponse("Task not found"));
                }

                // Apply updates
                if (updateDto.PhaseID.HasValue)
                    existingTask.PhaseID = updateDto.PhaseID;

                if (updateDto.ParentTaskID.HasValue)
                    existingTask.ParentTaskID = updateDto.ParentTaskID;

                if (updateDto.Order.HasValue)
                    existingTask.Order = updateDto.Order;

                if (!string.IsNullOrEmpty(updateDto.Title))
                    existingTask.Title = updateDto.Title;

                if (updateDto.Description != null)
                    existingTask.Description = updateDto.Description;

                if (!string.IsNullOrEmpty(updateDto.Status))
                    existingTask.Status = updateDto.Status;

                if (!string.IsNullOrEmpty(updateDto.Priority))
                    existingTask.Priority = updateDto.Priority;

                if (updateDto.AssigneeID.HasValue)
                    existingTask.AssigneeID = updateDto.AssigneeID;

                if (updateDto.StartDate.HasValue)
                    existingTask.StartDate = updateDto.StartDate;

                if (updateDto.DueDate.HasValue)
                    existingTask.DueDate = updateDto.DueDate;

                if (updateDto.EstimatedHours.HasValue)
                    existingTask.EstimatedHours = updateDto.EstimatedHours;

                if (updateDto.ActualHours.HasValue)
                    existingTask.ActualHours = updateDto.ActualHours;

                if (updateDto.Progress.HasValue)
                    existingTask.Progress = updateDto.Progress.Value;

                if (updateDto.Budget.HasValue)
                    existingTask.Budget = updateDto.Budget;

                if (updateDto.Spent.HasValue)
                    existingTask.Spent = updateDto.Spent;

                if (updateDto.Tags != null)
                    existingTask.Tags = updateDto.Tags;

                existingTask.UpdatedAt = DateTime.UtcNow;

                var updatedTask = await _taskRepository.UpdateAsync(siteId, id, existingTask);
                var taskDto = MapToDto(updatedTask);

                return Success(taskDto, "Task updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId}", id);
                return StatusCode(500, ApiResponse<TaskDto>.ErrorResponse("Error updating task"));
            }
        }

        /// <summary>
        /// Delete task (soft delete)
        /// </summary>
        /// <param name="id">Task ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var task = await _taskRepository.GetByIdAsync(siteId, id);

                if (task == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Task not found"));
                }

                await _taskRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Task deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting task"));
            }
        }

        /// <summary>
        /// Get tasks by project
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <returns>List of tasks in project</returns>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetByProject(Guid projectId)
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetByProjectAsync(siteId, projectId);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, "Tasks retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks for project {ProjectId}", projectId);
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving tasks"));
            }
        }

        /// <summary>
        /// Get tasks assigned to a user
        /// </summary>
        /// <param name="assigneeId">Assignee user ID</param>
        /// <returns>List of tasks assigned to user</returns>
        [HttpGet("assignee/{assigneeId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetByAssignee(Guid assigneeId)
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetByAssigneeAsync(siteId, assigneeId);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, "Tasks retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks for assignee {AssigneeId}", assigneeId);
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving tasks"));
            }
        }

        /// <summary>
        /// Get tasks by status
        /// </summary>
        /// <param name="status">Task status</param>
        /// <returns>List of tasks with specified status</returns>
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetByStatus(string status)
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetByStatusAsync(siteId, status);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, "Tasks retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks with status {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving tasks"));
            }
        }

        /// <summary>
        /// Get overdue tasks for current tenant
        /// </summary>
        /// <returns>List of overdue tasks</returns>
        [HttpGet("overdue")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetOverdue()
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetOverdueAsync(siteId);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, "Overdue tasks retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue tasks");
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving overdue tasks"));
            }
        }

        /// <summary>
        /// Get tasks due within specified days
        /// </summary>
        /// <param name="days">Number of days</param>
        /// <returns>List of tasks due soon</returns>
        [HttpGet("due-soon/{days}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskDto>>>> GetDueSoon(int days)
        {
            try
            {
                var siteId = GetSiteId();
                var tasks = await _taskRepository.GetDueSoonAsync(siteId, days);

                var taskDtos = tasks.Select(MapToDto);

                return Success(taskDtos, $"Tasks due within {days} days retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks due soon");
                return StatusCode(500, ApiResponse<IEnumerable<TaskDto>>.ErrorResponse("Error retrieving tasks due soon"));
            }
        }

        // Helper method to map entity to DTO
        private static TaskDto MapToDto(Models.Entities.Task task)
        {
            return new TaskDto
            {
                TaskID = task.TaskID,
                SiteID = task.SiteID,
                ProjectID = task.ProjectID,
                PhaseID = task.PhaseID,
                ParentTaskID = task.ParentTaskID,
                Order = task.Order,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                AssigneeID = task.AssigneeID,
                StartDate = task.StartDate,
                DueDate = task.DueDate,
                EstimatedHours = task.EstimatedHours,
                ActualHours = task.ActualHours,
                Progress = task.Progress,
                Budget = task.Budget,
                Spent = task.Spent,
                Tags = task.Tags,
                CreatedBy = task.CreatedBy,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
        }
    }
}
