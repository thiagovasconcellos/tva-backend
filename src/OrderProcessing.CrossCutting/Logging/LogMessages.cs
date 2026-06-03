using Microsoft.Extensions.Logging;

namespace OrderProcessing.CrossCutting.Logging;

public static partial class LogMessages
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Starting batch job {BatchJobId} with {TotalOrders} orders.")]
    public static partial void BatchJobStarted(this ILogger logger, Guid batchJobId, int totalOrders);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing order {OrderId} for customer '{CustomerName}'.")]
    public static partial void OrderProcessingStarted(this ILogger logger, Guid orderId, string customerName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Order {OrderId} completed successfully.")]
    public static partial void OrderCompleted(this ILogger logger, Guid orderId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Order {OrderId} failed: {ErrorMessage}")]
    public static partial void OrderFailed(this ILogger logger, Guid orderId, string errorMessage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Batch job {BatchJobId} finished. Completed: {Completed}, Failed: {Failed}.")]
    public static partial void BatchJobFinished(this ILogger logger, Guid batchJobId, int completed, int failed);

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception occurred: {Message}")]
    public static partial void UnhandledException(this ILogger logger, string message, Exception exception);
}
