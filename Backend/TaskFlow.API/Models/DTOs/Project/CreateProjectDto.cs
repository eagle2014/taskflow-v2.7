using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Project
{
    /// <summary>
    /// DTO for creating a new project
    /// </summary>
    public class CreateProjectDto
    {
        [Required(ErrorMessage = "Project name is required")]
        [MinLength(2, ErrorMessage = "Project name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public Guid CategoryID { get; set; }

        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
