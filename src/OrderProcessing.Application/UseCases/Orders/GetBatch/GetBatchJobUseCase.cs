using OrderProcessing.Application.DTOs;
using OrderProcessing.Application.Interfaces.UseCases;
using OrderProcessing.Domain.Exceptions;
using OrderProcessing.Domain.Interfaces.Repositories;

namespace OrderProcessing.Application.UseCases.Orders.GetBatch;

public sealed class GetBatchJobUseCase : IGetBatchJobUseCase
{
    private readonly IBatchJobRepository _batchJobRepository;
    private readonly IOrderRepository _orderRepository;

    public GetBatchJobUseCase(IBatchJobRepository batchJobRepository, IOrderRepository orderRepository)
    {
        _batchJobRepository = batchJobRepository;
        _orderRepository = orderRepository;
    }

    public async Task<GetBatchOutput> ExecuteAsync(GetBatchInput input, CancellationToken cancellationToken = default)
    {
        var batchJob = await _batchJobRepository.GetByIdAsync(input.BatchJobId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Domain.Entities.BatchJob), input.BatchJobId);

        var orders = await _orderRepository.GetByBatchJobIdAsync(input.BatchJobId, cancellationToken);

        var orderOutputs = orders.Select(o => new OrderOutput(
            o.Id,
            o.CustomerName,
            o.Status.ToString(),
            o.TotalAmount,
            o.CreatedAt,
            o.ProcessedAt,
            o.ErrorMessage,
            o.Items.Select(i => new OrderItemOutput(i.Id, i.ProductName, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList()
        )).ToList();

        return new GetBatchOutput(
            batchJob.Id,
            batchJob.Status.ToString(),
            batchJob.CreatedAt,
            batchJob.CompletedAt,
            batchJob.TotalOrders,
            batchJob.CompletedOrders,
            batchJob.FailedOrders,
            orderOutputs);
    }
}
