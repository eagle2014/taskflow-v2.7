using TaskFlow.API.Models.Entities;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Token service interface for JWT token generation and validation
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generates a JWT access token for a user
        /// </summary>
        /// <param name="user">User entity</param>
        /// <returns>JWT access token</returns>
        string GenerateAccessToken(User user);

        /// <summary>
        /// Generates a refresh token
        /// </summary>
        /// <returns>Refresh token string</returns>
        string GenerateRefreshToken();

        /// <summary>
        /// Validates a refresh token
        /// </summary>
        /// <param name="refreshToken">Refresh token to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        bool ValidateRefreshToken(string refreshToken);
    }
}
