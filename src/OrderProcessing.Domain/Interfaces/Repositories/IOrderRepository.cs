using OrderProcessing.Domain.Entities;

namespace OrderProcessing.Domain.Interfaces.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByBatchJobIdAsync(Guid batchJobId, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<Order> orders, CancellationToken cancellationToken = default);
    Task UpdateRangeAsync(IEnumerable<Order> orders, CancellationToken cancellationToken = default);
}
