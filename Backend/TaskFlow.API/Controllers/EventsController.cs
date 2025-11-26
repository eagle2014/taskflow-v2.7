using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.DTOs.Event;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Calendar events management endpoints with multi-tenant support
    /// </summary>
    public class EventsController : ApiControllerBase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<EventsController> _logger;

        public EventsController(
            IEventRepository eventRepository,
            ILogger<EventsController> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all events for current tenant
        /// </summary>
        /// <returns>List of events</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<EventDto>>>> GetAll()
        {
            try
            {
                var siteId = GetSiteId();
                var events = await _eventRepository.GetAllAsync(siteId);

                var eventDtos = events.Select(MapToDto);

                return Success(eventDtos, "Events retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events");
                return StatusCode(500, ApiResponse<IEnumerable<EventDto>>.ErrorResponse("Error retrieving events"));
            }
        }

        /// <summary>
        /// Get event by ID
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <returns>Event details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<EventDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var eventEntity = await _eventRepository.GetByIdAsync(siteId, id);

                if (eventEntity == null)
                {
                    return NotFound(ApiResponse<EventDto>.ErrorResponse("Event not found"));
                }

                var eventDto = MapToDto(eventEntity);

                return Success(eventDto, "Event retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event {EventId}", id);
                return StatusCode(500, ApiResponse<EventDto>.ErrorResponse("Error retrieving event"));
            }
        }

        /// <summary>
        /// Create new event
        /// </summary>
        /// <param name="createDto">Event creation data</param>
        /// <returns>Created event</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<EventDto>>> Create([FromBody] CreateEventDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var eventEntity = new CalendarEvent
                {
                    EventID = Guid.NewGuid(),
                    SiteID = siteId,
                    Title = createDto.Title,
                    Description = createDto.Description,
                    TaskID = createDto.TaskID,
                    Type = createDto.Type ?? "event",
                    Date = createDto.Date,
                    StartTime = createDto.StartTime,
                    EndTime = createDto.EndTime,
                    Location = createDto.Location,
                    Attendees = createDto.Attendees,
                    Color = createDto.Color,
                    ReminderMinutes = createDto.ReminderMinutes,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdEvent = await _eventRepository.AddAsync(eventEntity);
                var eventDto = MapToDto(createdEvent);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = eventDto.EventID },
                    ApiResponse<EventDto>.SuccessResponse(eventDto, "Event created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event");
                return StatusCode(500, ApiResponse<EventDto>.ErrorResponse("Error creating event"));
            }
        }

        /// <summary>
        /// Update existing event
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <param name="updateDto">Event update data</param>
        /// <returns>Updated event</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<EventDto>>> Update(Guid id, [FromBody] UpdateEventDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var existingEvent = await _eventRepository.GetByIdAsync(siteId, id);

                if (existingEvent == null)
                {
                    return NotFound(ApiResponse<EventDto>.ErrorResponse("Event not found"));
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Title))
                    existingEvent.Title = updateDto.Title;

                if (updateDto.Description != null)
                    existingEvent.Description = updateDto.Description;

                if (updateDto.TaskID.HasValue)
                    existingEvent.TaskID = updateDto.TaskID;

                if (!string.IsNullOrEmpty(updateDto.Type))
                    existingEvent.Type = updateDto.Type;

                if (updateDto.Date.HasValue)
                    existingEvent.Date = updateDto.Date.Value;

                if (updateDto.StartTime != null)
                    existingEvent.StartTime = updateDto.StartTime;

                if (updateDto.EndTime != null)
                    existingEvent.EndTime = updateDto.EndTime;

                if (updateDto.Location != null)
                    existingEvent.Location = updateDto.Location;

                if (updateDto.Attendees != null)
                    existingEvent.Attendees = updateDto.Attendees;

                if (updateDto.Color != null)
                    existingEvent.Color = updateDto.Color;

                if (updateDto.ReminderMinutes.HasValue)
                    existingEvent.ReminderMinutes = updateDto.ReminderMinutes;

                existingEvent.UpdatedAt = DateTime.UtcNow;

                var updatedEvent = await _eventRepository.UpdateAsync(siteId, id, existingEvent);
                var eventDto = MapToDto(updatedEvent);

                return Success(eventDto, "Event updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event {EventId}", id);
                return StatusCode(500, ApiResponse<EventDto>.ErrorResponse("Error updating event"));
            }
        }

        /// <summary>
        /// Delete event (soft delete)
        /// </summary>
        /// <param name="id">Event ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var eventEntity = await _eventRepository.GetByIdAsync(siteId, id);

                if (eventEntity == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Event not found"));
                }

                await _eventRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Event deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting event"));
            }
        }

        /// <summary>
        /// Get events by date range
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of events in date range</returns>
        [HttpGet("range")]
        public async Task<ActionResult<ApiResponse<IEnumerable<EventDto>>>> GetByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var siteId = GetSiteId();
                var events = await _eventRepository.GetByDateRangeAsync(siteId, startDate, endDate);

                var eventDtos = events.Select(MapToDto);

                return Success(eventDtos, "Events retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events by date range");
                return StatusCode(500, ApiResponse<IEnumerable<EventDto>>.ErrorResponse("Error retrieving events"));
            }
        }

        /// <summary>
        /// Get events by task
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>List of events for task</returns>
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<EventDto>>>> GetByTask(Guid taskId)
        {
            try
            {
                var siteId = GetSiteId();
                var events = await _eventRepository.GetByTaskAsync(siteId, taskId);

                var eventDtos = events.Select(MapToDto);

                return Success(eventDtos, "Events retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events for task {TaskId}", taskId);
                return StatusCode(500, ApiResponse<IEnumerable<EventDto>>.ErrorResponse("Error retrieving events"));
            }
        }

        /// <summary>
        /// Get events by type
        /// </summary>
        /// <param name="type">Event type</param>
        /// <returns>List of events of specified type</returns>
        [HttpGet("type/{type}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<EventDto>>>> GetByType(string type)
        {
            try
            {
                var siteId = GetSiteId();
                var events = await _eventRepository.GetByTypeAsync(siteId, type);

                var eventDtos = events.Select(MapToDto);

                return Success(eventDtos, "Events retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events of type {Type}", type);
                return StatusCode(500, ApiResponse<IEnumerable<EventDto>>.ErrorResponse("Error retrieving events"));
            }
        }

        // Helper method to map entity to DTO
        private static EventDto MapToDto(CalendarEvent eventEntity)
        {
            return new EventDto
            {
                EventID = eventEntity.EventID,
                SiteID = eventEntity.SiteID,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                TaskID = eventEntity.TaskID,
                Type = eventEntity.Type,
                Date = eventEntity.Date,
                StartTime = eventEntity.StartTime,
                EndTime = eventEntity.EndTime,
                Location = eventEntity.Location,
                Attendees = eventEntity.Attendees,
                Color = eventEntity.Color,
                ReminderMinutes = eventEntity.ReminderMinutes,
                CreatedBy = eventEntity.CreatedBy,
                CreatedAt = eventEntity.CreatedAt,
                UpdatedAt = eventEntity.UpdatedAt
            };
        }
    }
}
