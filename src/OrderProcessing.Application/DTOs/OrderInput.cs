namespace OrderProcessing.Application.DTOs;

public record OrderInput(
    string CustomerName,
    IReadOnlyList<OrderItemInput> Items
);
