using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// DTO for updating user profile
    /// </summary>
    public class UpdateUserDto
    {
        /// <summary>
        /// User's display name
        /// </summary>
        [StringLength(100)]
        public string? Name { get; set; }

        /// <summary>
        /// User's avatar URL
        /// </summary>
        [Url]
        [StringLength(500)]
        public string? Avatar { get; set; }

        /// <summary>
        /// User's role (Admin only can change)
        /// </summary>
        [StringLength(50)]
        public string? Role { get; set; }

        /// <summary>
        /// User's status (Active, Inactive, Suspended)
        /// </summary>
        [StringLength(20)]
        public string? Status { get; set; }
    }
}
