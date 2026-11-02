using MiniErp.Application.Products.Models;

namespace MiniErp.Application.Products.Models;

// Comments in English.
public sealed record CreateProductRequest(
    string Name,
    string? Supplier,
    string? Origin,
    decimal Price,
    int Stock,
    ProductStatus Status
);

public enum ProductStatus
{
    Active = 0,
    Inactive = 1,
    Draft = 2
}