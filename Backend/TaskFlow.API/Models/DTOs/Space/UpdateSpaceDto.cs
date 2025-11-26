using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Space
{
    /// <summary>
    /// DTO for updating space information
    /// </summary>
    public class UpdateSpaceDto
    {
        public Guid? ProjectID { get; set; }

        [MinLength(2, ErrorMessage = "Space name must be at least 2 characters")]
        public string? Name { get; set; }

        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? Order { get; set; }
        public string? ProjectIDs { get; set; }
    }
}
