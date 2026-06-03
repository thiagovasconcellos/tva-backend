namespace OrderProcessing.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice => Quantity * UnitPrice;

    private OrderItem() { }

    public static OrderItem Create(Guid orderId, string productName, int quantity, decimal unitPrice)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(productName);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(unitPrice);

        return new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductName = productName,
            Quantity = quantity,
            UnitPrice = unitPrice
        };
    }
}
