namespace MiniErp.Application.Suppliers.Models;

public sealed class SupplierListQuery
{
    public int Limit { get; set; } = 10;
    public string? Cursor { get; set; }

    public string? Keyword { get; set; }
    public string? Status { get; set; }
    public string? Region { get; set; }
    public string? Category { get; set; }
    public string? RiskLevel { get; set; }

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}