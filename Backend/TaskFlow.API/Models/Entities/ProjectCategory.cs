namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Project category entity with multi-tenant support
    /// </summary>
    public class ProjectCategory
    {
        public Guid CategoryID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
