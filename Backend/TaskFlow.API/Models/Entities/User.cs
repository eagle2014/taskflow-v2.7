namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// User entity with multi-tenant support
    /// </summary>
    public class User
    {
        public Guid UserID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
        public string Status { get; set; } = "Active";
        public string? Avatar { get; set; }
        public DateTime? LastActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
