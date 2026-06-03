namespace OrderProcessing.Domain.Enums;

public enum BatchJobStatus
{
    Queued = 0,
    Processing = 1,
    Completed = 2,
    PartiallyCompleted = 3
}
