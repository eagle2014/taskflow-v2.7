namespace TaskFlow.API.Models.DTOs.Task
{
    /// <summary>
    /// Task data transfer object
    /// </summary>
    public class TaskDto
    {
        public Guid TaskID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public Guid? ProjectID { get; set; }  // Nullable for subtasks
        public Guid? PhaseID { get; set; }
        public Guid? ParentTaskID { get; set; }
        public int? Order { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public Guid? AssigneeID { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public int Progress { get; set; }
        public decimal? Budget { get; set; }
        public decimal? Spent { get; set; }
        public string? Tags { get; set; }
        public string? SectionName { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
