using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// Login request DTO with multi-tenant support
    /// </summary>
    public class LoginDto
    {
        /// <summary>
        /// User email address
        /// </summary>
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User password
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [MinLength(3, ErrorMessage = "Password must be at least 3 characters")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Site ID for multi-tenant identification
        /// </summary>
        public string? SiteID { get; set; }

        /// <summary>
        /// Site Code for multi-tenant identification (alternative to SiteID)
        /// </summary>
        public string? SiteCode { get; set; }
    }
}
