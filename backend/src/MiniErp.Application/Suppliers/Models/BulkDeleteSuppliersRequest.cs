using System.ComponentModel.DataAnnotations;

namespace MiniErp.Application.Suppliers.Models;

public sealed class BulkDeleteSuppliersRequest
{
    [Required]
    public List<string> Ids { get; set; } = new();
}