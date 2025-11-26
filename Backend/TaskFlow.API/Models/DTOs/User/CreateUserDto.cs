using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models.DTOs.User
{
    /// <summary>
    /// DTO for creating a new user
    /// </summary>
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(3, ErrorMessage = "Password must be at least 3 characters")]
        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "Member";
        public string Status { get; set; } = "Active";
        public string? Avatar { get; set; }
    }
}
