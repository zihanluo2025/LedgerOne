using System.ComponentModel.DataAnnotations;

namespace MiniErp.Application.Suppliers.Models;

public sealed class UpdateSupplierRequest
{
    [Required]
    [MaxLength(50)]
    public string SupplierCode { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    public string SupplierName { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string PrimaryCategory { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string ContactPerson { get; set; } = default!;

    [EmailAddress]
    [MaxLength(200)]
    public string? ContactEmail { get; set; }

    [MaxLength(50)]
    public string? ContactPhone { get; set; }

    [Required]
    [MaxLength(100)]
    public string Region { get; set; } = default!;

    [MaxLength(300)]
    public string? Address { get; set; }

    [MaxLength(200)]
    public string? Website { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    public string RiskLevel { get; set; } = default!;

    public DateTime? LastOrderDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}