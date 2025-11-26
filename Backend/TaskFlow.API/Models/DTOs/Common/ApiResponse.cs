namespace TaskFlow.API.Models.DTOs.Common
{
    /// <summary>
    /// Generic API response wrapper for consistent response structure
    /// </summary>
    /// <typeparam name="T">Response data type</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indicates if the request was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Response message
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Response data
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// Error message (null if successful)
        /// </summary>
        public string? Error { get; set; }

        /// <summary>
        /// Creates a success response
        /// </summary>
        public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Error = null
            };
        }

        /// <summary>
        /// Creates an error response
        /// </summary>
        public static ApiResponse<T> ErrorResponse(string error, string? message = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default,
                Error = error
            };
        }
    }
}
