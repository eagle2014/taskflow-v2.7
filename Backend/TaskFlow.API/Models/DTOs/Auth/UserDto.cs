namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// User data transfer object
    /// </summary>
    public class UserDto
    {
        public Guid UserID { get; set; }
        public string SiteID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public DateTime? LastActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string SiteCode { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
    }
}
