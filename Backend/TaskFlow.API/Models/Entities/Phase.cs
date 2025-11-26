namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Phase entity for project phases with multi-tenant support
    /// Phases organize tasks within projects
    /// </summary>
    public class Phase
    {
        public Guid PhaseID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public Guid ProjectID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public int Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
