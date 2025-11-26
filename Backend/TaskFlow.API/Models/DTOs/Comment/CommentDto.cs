namespace TaskFlow.API.Models.DTOs.Comment
{
    /// <summary>
    /// Comment data transfer object
    /// </summary>
    public class CommentDto
    {
        public Guid CommentID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public Guid TaskID { get; set; }
        public Guid UserID { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
