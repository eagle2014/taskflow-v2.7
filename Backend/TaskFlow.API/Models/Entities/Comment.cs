namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Comment entity for task comments with multi-tenant support
    /// </summary>
    public class Comment
    {
        public Guid CommentID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public Guid TaskID { get; set; }
        public Guid UserID { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
