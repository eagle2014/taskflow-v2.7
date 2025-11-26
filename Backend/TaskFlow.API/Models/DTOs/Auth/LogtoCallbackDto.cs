using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// DTO for handling Logto OAuth callback
    /// </summary>
    public class LogtoCallbackDto
    {
        /// <summary>
        /// Authorization code from Logto callback
        /// </summary>
        [Required]
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// State parameter for CSRF protection
        /// </summary>
        [Required]
        public string State { get; set; } = string.Empty;

        /// <summary>
        /// Site code or ID to assign user to (can come from state or custom claim)
        /// </summary>
        public string? SiteIdentifier { get; set; }
    }
}
