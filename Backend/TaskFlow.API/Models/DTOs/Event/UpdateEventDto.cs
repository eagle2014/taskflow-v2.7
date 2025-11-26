using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Event
{
    /// <summary>
    /// DTO for updating event information
    /// </summary>
    public class UpdateEventDto
    {
        [MinLength(2, ErrorMessage = "Event title must be at least 2 characters")]
        public string? Title { get; set; }

        public string? Description { get; set; }
        public Guid? TaskID { get; set; }
        public string? Type { get; set; }
        public DateTime? Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? Location { get; set; }
        public string? Attendees { get; set; }
        public string? Color { get; set; }
        public int? ReminderMinutes { get; set; }
    }
}
