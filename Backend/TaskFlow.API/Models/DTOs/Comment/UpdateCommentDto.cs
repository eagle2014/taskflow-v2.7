using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Comment
{
    /// <summary>
    /// DTO for updating comment information
    /// </summary>
    public class UpdateCommentDto
    {
        [Required(ErrorMessage = "Comment content is required")]
        [MinLength(1, ErrorMessage = "Comment content cannot be empty")]
        public string Content { get; set; } = string.Empty;
    }
}
