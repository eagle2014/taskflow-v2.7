namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Project entity with multi-tenant support
    /// </summary>
    public class Project
    {
        public Guid ProjectID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid CategoryID { get; set; }
        public string Status { get; set; } = "Active";
        public string Priority { get; set; } = "Medium";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
