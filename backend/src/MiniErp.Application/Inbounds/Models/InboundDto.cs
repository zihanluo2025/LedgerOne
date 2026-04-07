namespace MiniErp.Application.Inbounds.Models;

public sealed record InboundDto(
    string Id,
    string InboundNo,
    string SupplierId,
    string Supplier,
    string Warehouse,
    int Items,
    int ExpectedQty,
    int ReceivedQty,
    string Date,
    string Status,
    DateTime CreatedAt
);