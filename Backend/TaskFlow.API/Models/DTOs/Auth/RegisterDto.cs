using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// User registration DTO with multi-tenant support
    /// </summary>
    public class RegisterDto
    {
        /// <summary>
        /// User's full name
        /// </summary>
        [Required(ErrorMessage = "Name is required")]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

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
        [Required(ErrorMessage = "Site ID is required")]
        public string SiteID { get; set; } = string.Empty;

        /// <summary>
        /// User role (defaults to Member)
        /// </summary>
        public string Role { get; set; } = "Member";
    }
}
