using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Phase
{
    /// <summary>
    /// DTO for creating a new phase
    /// </summary>
    public class CreatePhaseDto
    {
        [Required(ErrorMessage = "Project ID is required")]
        public string ProjectID { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phase name is required")]
        [MinLength(2, ErrorMessage = "Phase name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Color { get; set; }
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
