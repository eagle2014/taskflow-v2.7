using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Task
{
    /// <summary>
    /// DTO for creating a new task
    /// </summary>
    public class CreateTaskDto
    {
        public string? ProjectID { get; set; }  // Optional for subtasks (only ParentTaskID needed)

        public Guid? PhaseID { get; set; }
        public Guid? ParentTaskID { get; set; }
        public int? Order { get; set; }

        [Required(ErrorMessage = "Task title is required")]
        [MinLength(2, ErrorMessage = "Task title must be at least 2 characters")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public Guid? AssigneeID { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public int Progress { get; set; } = 0;
        public decimal? Budget { get; set; }
        public decimal? Spent { get; set; }
        public string? Tags { get; set; }
        public string? SectionName { get; set; }
    }
}
