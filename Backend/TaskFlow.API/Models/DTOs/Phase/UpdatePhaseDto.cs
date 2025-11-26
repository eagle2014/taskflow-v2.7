using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Phase
{
    /// <summary>
    /// DTO for updating phase information
    /// </summary>
    public class UpdatePhaseDto
    {
        [MinLength(2, ErrorMessage = "Phase name must be at least 2 characters")]
        public string? Name { get; set; }

        public string? Description { get; set; }
        public string? Color { get; set; }
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
