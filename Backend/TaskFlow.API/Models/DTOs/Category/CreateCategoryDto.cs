using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Category
{
    /// <summary>
    /// DTO for creating a new category
    /// </summary>
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [MinLength(2, ErrorMessage = "Category name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
    }
}
