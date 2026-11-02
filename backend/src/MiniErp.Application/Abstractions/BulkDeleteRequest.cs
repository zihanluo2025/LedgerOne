using System.ComponentModel.DataAnnotations;

namespace MiniErp.Application.Abstractions;

public sealed class BulkDeleteRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(500)]
    public List<string> Ids { get; set; } = new();
}
