namespace OrderProcessing.Application.DTOs;

public record OrderItemInput(
    string ProductName,
    int Quantity,
    decimal UnitPrice
);
