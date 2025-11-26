namespace TaskFlow.API.Models.DTOs.Space
{
    /// <summary>
    /// Space data transfer object
    /// </summary>
    public class SpaceDto
    {
        public Guid SpaceID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public Guid? ProjectID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int Order { get; set; }
        public string? ProjectIDs { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
