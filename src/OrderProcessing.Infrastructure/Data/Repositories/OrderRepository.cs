using Microsoft.EntityFrameworkCore;
using OrderProcessing.Domain.Entities;
using OrderProcessing.Domain.Interfaces.Repositories;
using OrderProcessing.Infrastructure.Data.Context;

namespace OrderProcessing.Infrastructure.Data.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task<IEnumerable<Order>> GetByBatchJobIdAsync(Guid batchJobId, CancellationToken cancellationToken = default)
        => await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BatchJobId == batchJobId)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Order entity, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<Order> orders, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddRangeAsync(orders, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Order entity, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateRangeAsync(IEnumerable<Order> orders, CancellationToken cancellationToken = default)
    {
        _context.Orders.UpdateRange(orders);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
