using OrderProcessing.Domain.Enums;
using OrderProcessing.Domain.Exceptions;

namespace OrderProcessing.Domain.Entities;

public class BatchJob
{
    public Guid Id { get; private set; }
    public BatchJobStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public int TotalOrders { get; private set; }
    public int CompletedOrders { get; private set; }
    public int FailedOrders { get; private set; }

    private BatchJob() { }

    public static BatchJob Create(int totalOrders)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(totalOrders);

        return new BatchJob
        {
            Id = Guid.NewGuid(),
            Status = BatchJobStatus.Queued,
            CreatedAt = DateTime.UtcNow,
            TotalOrders = totalOrders
        };
    }

    public void MarkAsProcessing()
    {
        if (Status != BatchJobStatus.Queued)
            throw new DomainException("INVALID_STATUS_TRANSITION", "Only queued jobs can be set to processing.");

        Status = BatchJobStatus.Processing;
    }

    public void Complete(int completedOrders, int failedOrders)
    {
        if (Status != BatchJobStatus.Processing)
            throw new DomainException("INVALID_STATUS_TRANSITION", "Only processing jobs can be completed.");

        CompletedOrders = completedOrders;
        FailedOrders = failedOrders;
        CompletedAt = DateTime.UtcNow;
        Status = failedOrders > 0 ? BatchJobStatus.PartiallyCompleted : BatchJobStatus.Completed;
    }
}
