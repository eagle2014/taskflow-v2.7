using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.User
{
    /// <summary>
    /// DTO for updating user information
    /// </summary>
    public class UpdateUserDto
    {
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string? Name { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? Avatar { get; set; }

        [MinLength(3, ErrorMessage = "Password must be at least 3 characters")]
        public string? Password { get; set; }
    }
}
