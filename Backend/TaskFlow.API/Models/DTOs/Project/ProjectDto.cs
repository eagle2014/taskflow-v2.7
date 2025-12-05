namespace TaskFlow.API.Models.DTOs.Project
{
    /// <summary>
    /// Project data transfer object
    /// </summary>
    public class ProjectDto
    {
        public Guid ProjectID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CategoryID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
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
    }
}
