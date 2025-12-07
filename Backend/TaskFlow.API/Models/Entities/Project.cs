namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Project entity with multi-tenant support
    /// </summary>
    public class Project
    {
        public Guid RowPointer { get; set; }  // Internal GUID (UUID)
        public string SiteID { get; set; } = string.Empty;
        public string ProjectID { get; set; } = string.Empty;  // Human-readable code (e.g., "PRJ-0001")
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CategoryID { get; set; }
        public string Status { get; set; } = "Active";
        public string Priority { get; set; } = "Medium";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // CRM Integration Fields
        public Guid? AssigneeID { get; set; }
        public Guid? CustomerID { get; set; }
        public Guid? ContactID { get; set; }
        public Guid? DealID { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string? ProjectUrl { get; set; }
        public int Progress { get; set; } = 0;

        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
