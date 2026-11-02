namespace MiniErp.Api.Middleware;

// Translates application exceptions into consistent JSON error responses: { "message": "..." }.
public sealed class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiExceptionMiddleware> _logger;

    public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex) when (!context.Response.HasStarted)
        {
            var (status, message) = ex switch
            {
                ArgumentException => (StatusCodes.Status400BadRequest, ex.Message),
                KeyNotFoundException => (StatusCodes.Status404NotFound, ex.Message),
                UnauthorizedAccessException => (StatusCodes.Status403Forbidden, ex.Message),
                InvalidOperationException => (StatusCodes.Status409Conflict, ex.Message),
                OperationCanceledException when context.RequestAborted.IsCancellationRequested
                    => (StatusCodes.Status499ClientClosedRequest, "Request cancelled."),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
            };

            if (status >= StatusCodes.Status500InternalServerError)
                _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            else
                _logger.LogInformation("Request rejected ({Status}): {Message}", status, ex.Message);

            context.Response.Clear();
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new { message });
        }
    }
}
