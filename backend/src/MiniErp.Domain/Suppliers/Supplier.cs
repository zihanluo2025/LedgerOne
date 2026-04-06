namespace MiniErp.Domain.Suppliers;

public class Supplier
{
    public string Id { get; set; } = default!;
    public string SupplierCode { get; set; } = default!;
    public string SupplierName { get; set; } = default!;
    public string PrimaryCategory { get; set; } = default!;

    public string ContactPerson { get; set; } = default!;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }

    public string Region { get; set; } = default!;
    public string? Address { get; set; }
    public string? Website { get; set; }

    public string Status { get; set; } = default!;
    public string RiskLevel { get; set; } = default!;

    public DateTime? LastOrderDate { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}