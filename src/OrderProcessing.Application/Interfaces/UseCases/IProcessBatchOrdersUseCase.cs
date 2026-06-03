using OrderProcessing.Application.UseCases.Orders.ProcessBatch;

namespace OrderProcessing.Application.Interfaces.UseCases;

public interface IProcessBatchOrdersUseCase
{
    Task<ProcessBatchOutput> ExecuteAsync(ProcessBatchInput input, CancellationToken cancellationToken = default);
}
