using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Project
{
    /// <summary>
    /// DTO for creating a new project
    /// </summary>
    public class CreateProjectDto
    {
        public string? ProjectID { get; set; }  // Optional - auto-generated if not provided (e.g., "PRJ-0001")

        [Required(ErrorMessage = "Project name is required")]
        [MinLength(2, ErrorMessage = "Project name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? CategoryID { get; set; }

        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // CRM Integration Fields
        public Guid? AssigneeID { get; set; }
        public Guid? CustomerID { get; set; }
        public Guid? ContactID { get; set; }
        public Guid? DealID { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string? ProjectUrl { get; set; }
        public int Progress { get; set; } = 0;
    }
}
