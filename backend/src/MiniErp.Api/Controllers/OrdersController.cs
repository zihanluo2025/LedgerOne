using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Orders;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly OrderService _service;

    public OrdersController(OrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetList(
        [FromQuery] string? keyword,
        [FromQuery] OrderStatus? status,
        [FromQuery] int limit = Paging.DefaultLimit,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.GetListAsync(new OrderListQuery(keyword, status, limit, cursor), cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(
        [FromBody] CreateOrderRequest body,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(body, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrderDto>> Update(
        string id,
        [FromBody] UpdateOrderRequest body,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, body, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        => await _service.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
