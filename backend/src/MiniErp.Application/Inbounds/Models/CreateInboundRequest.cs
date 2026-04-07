namespace MiniErp.Application.Inbounds.Models;

public sealed record CreateInboundRequest(
    string SupplierId,
    string Warehouse,
    int ExpectedQty,
    int Items,
    string ExpectedDate,
    string? Notes
);