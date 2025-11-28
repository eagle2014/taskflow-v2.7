using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Project
{
    /// <summary>
    /// DTO for updating project information
    /// </summary>
    public class UpdateProjectDto
    {
        [MinLength(2, ErrorMessage = "Project name must be at least 2 characters")]
        public string? Name { get; set; }

        public string? Description { get; set; }
        public string? CategoryID { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
