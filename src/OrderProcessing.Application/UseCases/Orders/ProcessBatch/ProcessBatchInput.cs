using OrderProcessing.Application.DTOs;

namespace OrderProcessing.Application.UseCases.Orders.ProcessBatch;

public record ProcessBatchInput(IReadOnlyList<OrderInput> Orders);
