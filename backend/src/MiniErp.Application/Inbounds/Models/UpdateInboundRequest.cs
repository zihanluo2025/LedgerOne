namespace MiniErp.Application.Inbounds.Models;

public sealed record UpdateInboundRequest(
    string SupplierId,
    string Warehouse,
    int ExpectedQty,
    int Items,
    string ExpectedDate,
    string? Notes
);