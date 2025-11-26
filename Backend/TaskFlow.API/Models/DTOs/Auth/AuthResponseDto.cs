namespace TaskFlow.API.Models.DTOs.Auth
{
    /// <summary>
    /// Authentication response DTO containing tokens and user info
    /// </summary>
    public class AuthResponseDto
    {
        /// <summary>
        /// JWT access token
        /// </summary>
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>
        /// Refresh token for obtaining new access tokens
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Token expiration time in seconds
        /// </summary>
        public int ExpiresIn { get; set; }

        /// <summary>
        /// User information
        /// </summary>
        public UserDto User { get; set; } = new UserDto();
    }
}
