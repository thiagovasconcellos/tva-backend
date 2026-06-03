using Microsoft.EntityFrameworkCore;
using OrderProcessing.Domain.Entities;
using OrderProcessing.Domain.Interfaces.Repositories;
using OrderProcessing.Infrastructure.Data.Context;

namespace OrderProcessing.Infrastructure.Data.Repositories;

public class BatchJobRepository : IBatchJobRepository
{
    private readonly ApplicationDbContext _context;

    public BatchJobRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BatchJob?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.BatchJobs.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task AddAsync(BatchJob entity, CancellationToken cancellationToken = default)
    {
        await _context.BatchJobs.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(BatchJob entity, CancellationToken cancellationToken = default)
    {
        _context.BatchJobs.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
