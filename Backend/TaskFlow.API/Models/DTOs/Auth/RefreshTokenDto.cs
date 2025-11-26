using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// Refresh token request DTO
    /// </summary>
    public class RefreshTokenDto
    {
        /// <summary>
        /// Refresh token
        /// </summary>
        [Required(ErrorMessage = "Refresh token is required")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
