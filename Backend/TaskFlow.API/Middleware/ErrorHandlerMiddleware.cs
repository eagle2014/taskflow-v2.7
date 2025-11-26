using System.Net;
using System.Text.Json;
using TaskFlow.API.Models.DTOs.Common;

namespace TaskFlow.API.Middleware
{
    /// <summary>
    /// Global error handling middleware for consistent error responses
    /// </summary>
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ErrorHandlerMiddleware(
            RequestDelegate next,
            ILogger<ErrorHandlerMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Log the exception
            _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            // Determine status code and error message based on exception type
            var (statusCode, message, details) = exception switch
            {
                UnauthorizedAccessException => (
                    HttpStatusCode.Unauthorized,
                    "Unauthorized access",
                    exception.Message
                ),
                InvalidOperationException => (
                    HttpStatusCode.BadRequest,
                    "Invalid operation",
                    exception.Message
                ),
                ArgumentException => (
                    HttpStatusCode.BadRequest,
                    "Invalid argument",
                    exception.Message
                ),
                KeyNotFoundException => (
                    HttpStatusCode.NotFound,
                    "Resource not found",
                    exception.Message
                ),
                TimeoutException => (
                    HttpStatusCode.RequestTimeout,
                    "Request timeout",
                    exception.Message
                ),
                _ => (
                    HttpStatusCode.InternalServerError,
                    "An internal server error occurred",
                    _env.IsDevelopment() ? exception.Message : "Please contact support"
                )
            };

            // Create error response
            var response = new ApiResponse<object>
            {
                Success = false,
                Error = message,
                Message = details,
                Data = null
            };

            // Add stack trace in development mode
            if (_env.IsDevelopment() && exception is not UnauthorizedAccessException)
            {
                response.Message = $"{details}\n\nStack Trace:\n{exception.StackTrace}";
            }

            // Set response properties
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            // Write response
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = _env.IsDevelopment()
            };

            var jsonResponse = JsonSerializer.Serialize(response, options);
            await context.Response.WriteAsync(jsonResponse);
        }
    }

    /// <summary>
    /// Extension method for easy middleware registration
    /// </summary>
    public static class ErrorHandlerMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorHandler(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ErrorHandlerMiddleware>();
        }
    }
}
