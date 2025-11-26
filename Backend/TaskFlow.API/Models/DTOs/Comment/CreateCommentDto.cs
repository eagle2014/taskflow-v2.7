using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Comment
{
    /// <summary>
    /// DTO for creating a new comment
    /// </summary>
    public class CreateCommentDto
    {
        [Required(ErrorMessage = "Task ID is required")]
        public Guid TaskID { get; set; }

        [Required(ErrorMessage = "Comment content is required")]
        [MinLength(1, ErrorMessage = "Comment content cannot be empty")]
        public string Content { get; set; } = string.Empty;

        public Guid? ParentCommentID { get; set; }
    }
}
