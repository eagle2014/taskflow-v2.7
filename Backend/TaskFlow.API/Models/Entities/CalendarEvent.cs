namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Calendar event entity with multi-tenant support
    /// </summary>
    public class CalendarEvent
    {
        public Guid EventID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? TaskID { get; set; }
        public string Type { get; set; } = "event";
        public DateTime Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? Location { get; set; }
        public string? Attendees { get; set; }
        public string? Color { get; set; }
        public int? ReminderMinutes { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
