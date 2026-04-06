namespace MiniErp.Application.Suppliers.Models;

public sealed record SupplierSummaryDto(
    int TotalSuppliers,
    int ActiveSuppliers,
    int PendingReviewSuppliers,
    int HighRiskSuppliers
);