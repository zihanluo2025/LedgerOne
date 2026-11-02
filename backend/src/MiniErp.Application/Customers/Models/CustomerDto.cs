namespace MiniErp.Application.Customers.Models;

public sealed record CustomerDto(
    string Id,
    string CustomerCode,
    string CustomerName,
    string CompanyName,
    string Segment,
    string ContactPerson,
    string? ContactEmail,
    string? ContactPhone,
    string Region,
    string? Address,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime UpdatedAt,
    string UpdatedBy
);
