using System.Net;
using System.Text.Json;
using OrderProcessing.CrossCutting.Exceptions;
using OrderProcessing.CrossCutting.Logging;
using OrderProcessing.Domain.Exceptions;

namespace OrderProcessing.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
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
        catch (EntityNotFoundException ex)
        {
            await WriteErrorResponseAsync(context, HttpStatusCode.NotFound, ex.Code, ex.Message);
        }
        catch (DomainException ex)
        {
            await WriteErrorResponseAsync(context, HttpStatusCode.UnprocessableEntity, ex.Code, ex.Message);
        }
        catch (AppException ex)
        {
            await WriteErrorResponseAsync(context, (HttpStatusCode)ex.StatusCode, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.UnhandledException(ex.Message, ex);
            await WriteErrorResponseAsync(context, HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.");
        }
    }

    private static Task WriteErrorResponseAsync(HttpContext context, HttpStatusCode statusCode, string code, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new { code, message };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
