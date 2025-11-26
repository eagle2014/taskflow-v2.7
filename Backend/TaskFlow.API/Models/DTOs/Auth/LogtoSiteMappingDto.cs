namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// DTO representing a Logto user's site assignment
    /// </summary>
    public class LogtoSiteMappingDto
    {
        /// <summary>
        /// Mapping ID
        /// </summary>
        public Guid MappingID { get; set; }

        /// <summary>
        /// Logto user ID
        /// </summary>
        public string LogtoUserID { get; set; } = string.Empty;

        /// <summary>
        /// TaskFlow user ID
        /// </summary>
        public Guid UserID { get; set; }

        /// <summary>
        /// Site ID
        /// </summary>
        public string SiteID { get; set; } = string.Empty;

        /// <summary>
        /// Site code (e.g., ACME, TECHSTART)
        /// </summary>
        public string SiteCode { get; set; } = string.Empty;

        /// <summary>
        /// Site name
        /// </summary>
        public string SiteName { get; set; } = string.Empty;

        /// <summary>
        /// Site domain
        /// </summary>
        public string? Domain { get; set; }

        /// <summary>
        /// User's email
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// User's avatar URL
        /// </summary>
        public string? Avatar { get; set; }

        /// <summary>
        /// User's role in this site
        /// </summary>
        public string Role { get; set; } = string.Empty;

        /// <summary>
        /// Whether this mapping is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// When this mapping was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Last time this user was synced from Logto
        /// </summary>
        public DateTime? LastSyncAt { get; set; }
    }
}
