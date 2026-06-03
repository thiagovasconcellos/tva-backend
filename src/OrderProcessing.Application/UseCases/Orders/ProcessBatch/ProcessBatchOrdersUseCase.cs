using Microsoft.Extensions.Logging;
using OrderProcessing.Application.DTOs;
using OrderProcessing.Application.Interfaces.UseCases;
using OrderProcessing.CrossCutting.Logging;
using OrderProcessing.Domain.Entities;
using OrderProcessing.Domain.Interfaces.Repositories;

namespace OrderProcessing.Application.UseCases.Orders.ProcessBatch;

public sealed class ProcessBatchOrdersUseCase : IProcessBatchOrdersUseCase
{
    // Limits how many orders are processed simultaneously to avoid overwhelming the DB and CPU.
    // Without this, Task.WhenAll would fire all tasks at once — fine for 10 orders, risky for 10,000.
    private const int MaxConcurrency = 5;

    private readonly IBatchJobRepository _batchJobRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<ProcessBatchOrdersUseCase> _logger;

    public ProcessBatchOrdersUseCase(
        IBatchJobRepository batchJobRepository,
        IOrderRepository orderRepository,
        ILogger<ProcessBatchOrdersUseCase> logger)
    {
        _batchJobRepository = batchJobRepository;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public async Task<ProcessBatchOutput> ExecuteAsync(ProcessBatchInput input, CancellationToken cancellationToken = default)
    {
        var batchJob = BatchJob.Create(input.Orders.Count);
        await _batchJobRepository.AddAsync(batchJob, cancellationToken);

        batchJob.MarkAsProcessing();
        await _batchJobRepository.UpdateAsync(batchJob, cancellationToken);

        _logger.BatchJobStarted(batchJob.Id, batchJob.TotalOrders);

        // SemaphoreSlim acts as a concurrency gate: at most MaxConcurrency tasks run at the same time.
        // Each task must acquire a slot before processing and release it when done.
        var semaphore = new SemaphoreSlim(MaxConcurrency);

        var processingTasks = input.Orders
            .Select(orderInput => ProcessSingleOrderAsync(orderInput, batchJob.Id, semaphore, cancellationToken))
            .ToList();

        // Task.WhenAll launches all tasks concurrently and waits until every one completes.
        // The SemaphoreSlim above ensures only MaxConcurrency run in parallel at any moment.
        var results = await Task.WhenAll(processingTasks);

        int completedCount = results.Count(r => r);
        int failedCount = results.Count(r => !r);

        batchJob.Complete(completedCount, failedCount);
        await _batchJobRepository.UpdateAsync(batchJob, cancellationToken);

        _logger.BatchJobFinished(batchJob.Id, completedCount, failedCount);

        return new ProcessBatchOutput(
            batchJob.Id,
            batchJob.TotalOrders,
            completedCount,
            failedCount,
            batchJob.Status.ToString());
    }

    private async Task<bool> ProcessSingleOrderAsync(
        OrderInput input,
        Guid batchJobId,
        SemaphoreSlim semaphore,
        CancellationToken cancellationToken)
    {
        // WaitAsync suspends THIS task until a concurrency slot is free — other tasks keep running.
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            var order = Order.Create(batchJobId, input.CustomerName);

            foreach (var item in input.Items)
                order.AddItem(item.ProductName, item.Quantity, item.UnitPrice);

            await _orderRepository.AddAsync(order, cancellationToken);

            order.MarkAsProcessing();

            _logger.OrderProcessingStarted(order.Id, order.CustomerName);

            // Simulates async work such as an external validation service call.
            // In production this would be a real HTTP or database call.
            await Task.Delay(Random.Shared.Next(50, 300), cancellationToken);

            order.MarkAsCompleted();
            await _orderRepository.UpdateAsync(order, cancellationToken);

            _logger.OrderCompleted(order.Id);
            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.OrderFailed(Guid.Empty, ex.Message);
            return false;
        }
        finally
        {
            // Always release the slot so another waiting task can proceed.
            semaphore.Release();
        }
    }
}
