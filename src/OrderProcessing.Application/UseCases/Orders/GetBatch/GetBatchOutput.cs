using OrderProcessing.Application.DTOs;

namespace OrderProcessing.Application.UseCases.Orders.GetBatch;

public record GetBatchOutput(
    Guid BatchJobId,
    string Status,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    int TotalOrders,
    int CompletedOrders,
    int FailedOrders,
    IReadOnlyList<OrderOutput> Orders
);
