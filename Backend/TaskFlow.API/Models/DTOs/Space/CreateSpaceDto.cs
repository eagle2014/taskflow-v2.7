using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Space
{
    /// <summary>
    /// DTO for creating a new space
    /// </summary>
    public class CreateSpaceDto
    {
        public Guid? ProjectID { get; set; }

        [Required(ErrorMessage = "Space name is required")]
        [MinLength(2, ErrorMessage = "Space name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? Order { get; set; }
        public string? ProjectIDs { get; set; }
    }
}
