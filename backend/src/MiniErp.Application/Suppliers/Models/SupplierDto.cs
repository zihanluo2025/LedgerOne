namespace MiniErp.Application.Suppliers.Models;

public sealed record SupplierDto(
    string Id,
    string SupplierCode,
    string SupplierName,
    string PrimaryCategory,
    string ContactPerson,
    string? ContactEmail,
    string? ContactPhone,
    string Region,
    string? Address,
    string? Website,
    string Status,
    string RiskLevel,
    DateTime? LastOrderDate,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);