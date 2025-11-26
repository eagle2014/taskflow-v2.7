using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Category
{
    /// <summary>
    /// DTO for updating category information
    /// </summary>
    public class UpdateCategoryDto
    {
        [MinLength(2, ErrorMessage = "Category name must be at least 2 characters")]
        public string? Name { get; set; }

        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
    }
}
