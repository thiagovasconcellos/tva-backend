namespace OrderProcessing.Application.UseCases.Orders.ProcessBatch;

public record ProcessBatchOutput(
    Guid BatchJobId,
    int TotalOrders,
    int CompletedOrders,
    int FailedOrders,
    string Status
);
