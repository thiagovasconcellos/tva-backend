using OrderProcessing.Application.UseCases.Orders.GetBatch;

namespace OrderProcessing.Application.Interfaces.UseCases;

public interface IGetBatchJobUseCase
{
    Task<GetBatchOutput> ExecuteAsync(GetBatchInput input, CancellationToken cancellationToken = default);
}
