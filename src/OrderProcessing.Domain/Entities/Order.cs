using OrderProcessing.Domain.Enums;
using OrderProcessing.Domain.Exceptions;

namespace OrderProcessing.Domain.Entities;

public class Order
{
    private readonly List<OrderItem> _items = [];

    public Guid Id { get; private set; }
    public Guid BatchJobId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public decimal TotalAmount => _items.Sum(i => i.TotalPrice);
    public OrderStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? ErrorMessage { get; private set; }

    private Order() { }

    public static Order Create(Guid batchJobId, string customerName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(customerName);

        return new Order
        {
            Id = Guid.NewGuid(),
            BatchJobId = batchJobId,
            CustomerName = customerName,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddItem(string productName, int quantity, decimal unitPrice)
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("ORDER_NOT_EDITABLE", "Items can only be added to pending orders.");

        _items.Add(OrderItem.Create(Id, productName, quantity, unitPrice));
    }

    public void MarkAsProcessing()
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("INVALID_STATUS_TRANSITION", "Only pending orders can be set to processing.");

        Status = OrderStatus.Processing;
    }

    public void MarkAsCompleted()
    {
        if (Status != OrderStatus.Processing)
            throw new DomainException("INVALID_STATUS_TRANSITION", "Only processing orders can be completed.");

        Status = OrderStatus.Completed;
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string errorMessage)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(errorMessage);

        Status = OrderStatus.Failed;
        ProcessedAt = DateTime.UtcNow;
        ErrorMessage = errorMessage;
    }
}
