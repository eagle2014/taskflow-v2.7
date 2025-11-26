using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Phase
{
    /// <summary>
    /// DTO for reordering phases within a project
    /// </summary>
    public class ReorderPhasesDto
    {
        [Required(ErrorMessage = "Project ID is required")]
        public Guid ProjectID { get; set; }

        [Required(ErrorMessage = "Phase IDs are required")]
        [MinLength(1, ErrorMessage = "At least one phase ID is required")]
        public List<Guid> PhaseIDs { get; set; } = new List<Guid>();
    }
}
