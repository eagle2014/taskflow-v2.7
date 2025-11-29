using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Task
{
    /// <summary>
    /// DTO for updating task information
    /// </summary>
    public class UpdateTaskDto
    {
        public Guid? PhaseID { get; set; }
        public Guid? ParentTaskID { get; set; }
        public int? Order { get; set; }

        [MinLength(2, ErrorMessage = "Task title must be at least 2 characters")]
        public string? Title { get; set; }

        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public Guid? AssigneeID { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public int? Progress { get; set; }
        public decimal? Budget { get; set; }
        public decimal? Spent { get; set; }
        public string? Tags { get; set; }
        public string? SectionName { get; set; }
    }
}
