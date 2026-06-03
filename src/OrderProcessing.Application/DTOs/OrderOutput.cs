namespace OrderProcessing.Application.DTOs;

public record OrderOutput(
    Guid Id,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime? ProcessedAt,
    string? ErrorMessage,
    IReadOnlyList<OrderItemOutput> Items
);
