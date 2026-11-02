using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/inbounds")]
public sealed class InboundsController : ControllerBase
{
    private readonly InboundService _service;

    public InboundsController(InboundService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<InboundDto>>> GetList(
        [FromQuery] string? keyword,
        [FromQuery] string? warehouse,
        [FromQuery] string? status,
        [FromQuery] int limit = Paging.DefaultLimit,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.GetListAsync(
            new InboundListQuery(keyword, warehouse, status, limit, cursor),
            cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<InboundDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<InboundDto>> Create(
        [FromBody] CreateInboundRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InboundDto>> Update(
        string id,
        [FromBody] UpdateInboundRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        => await _service.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete(
        [FromBody] BulkDeleteRequest request,
        CancellationToken cancellationToken)
    {
        await _service.BulkDeleteAsync(request.Ids, cancellationToken);
        return NoContent();
    }
}
