namespace TaskFlow.API.Models.DTOs.Category
{
    /// <summary>
    /// Project category data transfer object
    /// </summary>
    public class CategoryDto
    {
        public Guid CategoryID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
