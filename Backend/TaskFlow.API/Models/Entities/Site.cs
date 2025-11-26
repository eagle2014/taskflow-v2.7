namespace TaskFlow.API.Models.Entities
{
    /// <summary>
    /// Site entity for multi-tenant support
    /// Each site represents a separate tenant/organization
    /// </summary>
    public class Site
    {
        public string SiteID { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
        public string? Domain { get; set; }
        public bool IsActive { get; set; } = true;
        public int MaxUsers { get; set; } = 100;
        public int MaxProjects { get; set; } = 50;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
