using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Controllers.Base;
using TaskFlow.API.Models.DTOs.Comment;
using TaskFlow.API.Models.DTOs.Common;
using TaskFlow.API.Models.Entities;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Comments management endpoints with multi-tenant support
    /// </summary>
    public class CommentsController : ApiControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(
            ICommentRepository commentRepository,
            ILogger<CommentsController> logger)
        {
            _commentRepository = commentRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get comments by task
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>List of comments for task</returns>
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CommentDto>>>> GetByTask(Guid taskId)
        {
            try
            {
                var siteId = GetSiteId();
                var comments = await _commentRepository.GetByTaskAsync(siteId, taskId);

                var commentDtos = comments.Select(MapToDto);

                return Success(commentDtos, "Comments retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for task {TaskId}", taskId);
                return StatusCode(500, ApiResponse<IEnumerable<CommentDto>>.ErrorResponse("Error retrieving comments"));
            }
        }

        /// <summary>
        /// Get comment by ID
        /// </summary>
        /// <param name="id">Comment ID</param>
        /// <returns>Comment details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CommentDto>>> GetById(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var comment = await _commentRepository.GetByIdAsync(siteId, id);

                if (comment == null)
                {
                    return NotFound(ApiResponse<CommentDto>.ErrorResponse("Comment not found"));
                }

                var commentDto = MapToDto(comment);

                return Success(commentDto, "Comment retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comment {CommentId}", id);
                return StatusCode(500, ApiResponse<CommentDto>.ErrorResponse("Error retrieving comment"));
            }
        }

        /// <summary>
        /// Create new comment
        /// </summary>
        /// <param name="createDto">Comment creation data</param>
        /// <returns>Created comment</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CommentDto>>> Create([FromBody] CreateCommentDto createDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();

                var comment = new Comment
                {
                    CommentID = Guid.NewGuid(),
                    SiteID = siteId,
                    TaskID = createDto.TaskID,
                    UserID = userId,
                    Content = createDto.Content,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdComment = await _commentRepository.AddAsync(comment);
                var commentDto = MapToDto(createdComment);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = commentDto.CommentID },
                    ApiResponse<CommentDto>.SuccessResponse(commentDto, "Comment created successfully")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                return StatusCode(500, ApiResponse<CommentDto>.ErrorResponse("Error creating comment"));
            }
        }

        /// <summary>
        /// Update existing comment
        /// </summary>
        /// <param name="id">Comment ID</param>
        /// <param name="updateDto">Comment update data</param>
        /// <returns>Updated comment</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CommentDto>>> Update(Guid id, [FromBody] UpdateCommentDto updateDto)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();
                var existingComment = await _commentRepository.GetByIdAsync(siteId, id);

                if (existingComment == null)
                {
                    return NotFound(ApiResponse<CommentDto>.ErrorResponse("Comment not found"));
                }

                // Users can only edit their own comments unless they are Admin
                var currentUserRole = GetUserRole();
                if (existingComment.UserID != userId && currentUserRole != "Admin")
                {
                    return Forbid();
                }

                // Apply updates
                if (!string.IsNullOrEmpty(updateDto.Content))
                    existingComment.Content = updateDto.Content;

                existingComment.UpdatedAt = DateTime.UtcNow;

                var updatedComment = await _commentRepository.UpdateAsync(siteId, id, existingComment);
                var commentDto = MapToDto(updatedComment);

                return Success(commentDto, "Comment updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {CommentId}", id);
                return StatusCode(500, ApiResponse<CommentDto>.ErrorResponse("Error updating comment"));
            }
        }

        /// <summary>
        /// Delete comment (soft delete)
        /// </summary>
        /// <param name="id">Comment ID</param>
        /// <returns>Success response</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
        {
            try
            {
                var siteId = GetSiteId();
                var userId = GetUserId();
                var comment = await _commentRepository.GetByIdAsync(siteId, id);

                if (comment == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Comment not found"));
                }

                // Users can only delete their own comments unless they are Admin
                var currentUserRole = GetUserRole();
                if (comment.UserID != userId && currentUserRole != "Admin")
                {
                    return Forbid();
                }

                await _commentRepository.DeleteAsync(siteId, id);

                return Success<object>(null, "Comment deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResponse("Error deleting comment"));
            }
        }

        /// <summary>
        /// Get comments by user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>List of comments by user</returns>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CommentDto>>>> GetByUser(Guid userId)
        {
            try
            {
                var siteId = GetSiteId();
                var comments = await _commentRepository.GetByUserAsync(siteId, userId);

                var commentDtos = comments.Select(MapToDto);

                return Success(commentDtos, "Comments retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for user {UserId}", userId);
                return StatusCode(500, ApiResponse<IEnumerable<CommentDto>>.ErrorResponse("Error retrieving comments"));
            }
        }

        // Helper method to map entity to DTO
        private static CommentDto MapToDto(Comment comment)
        {
            return new CommentDto
            {
                CommentID = comment.CommentID,
                SiteID = comment.SiteID,
                TaskID = comment.TaskID,
                UserID = comment.UserID,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            };
        }
    }
}
