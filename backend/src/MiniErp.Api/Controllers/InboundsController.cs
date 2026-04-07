using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/inbounds")]
public class InboundsController : ControllerBase
{
    private readonly InboundService _service;

    public InboundsController(InboundService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult> GetList(
        [FromQuery] string? keyword,
        [FromQuery] int limit = 50,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.GetListAsync(
            new InboundListQuery(keyword, limit, cursor),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateInboundRequest request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateInboundRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpPost("bulk-delete")]
    public async Task<ActionResult> BulkDelete([FromBody] IEnumerable<string> ids)
    {
        await _service.BulkDeleteAsync(ids);
        return NoContent();
    }
}