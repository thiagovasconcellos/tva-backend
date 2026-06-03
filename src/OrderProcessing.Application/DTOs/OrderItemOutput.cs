namespace OrderProcessing.Application.DTOs;

public record OrderItemOutput(
    Guid Id,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);
