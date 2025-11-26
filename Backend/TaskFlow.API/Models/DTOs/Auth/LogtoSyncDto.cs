using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// DTO for syncing Logto user to TaskFlow database
    /// </summary>
    public class LogtoSyncDto
    {
        /// <summary>
        /// Logto user ID (sub claim from JWT)
        /// </summary>
        [Required]
        public string LogtoUserID { get; set; } = string.Empty;

        /// <summary>
        /// Site ID or Site Code to assign user to
        /// </summary>
        [Required]
        public string SiteIdentifier { get; set; } = string.Empty;

        /// <summary>
        /// User's email from Logto
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's name from Logto
        /// </summary>
        [Required]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// User's avatar URL from Logto (optional)
        /// </summary>
        public string? Avatar { get; set; }

        /// <summary>
        /// User's role in the system (default: Member)
        /// </summary>
        public string Role { get; set; } = "Member";

        /// <summary>
        /// Raw Logto access token (for validation)
        /// </summary>
        [Required]
        public string LogtoAccessToken { get; set; } = string.Empty;
    }
}
