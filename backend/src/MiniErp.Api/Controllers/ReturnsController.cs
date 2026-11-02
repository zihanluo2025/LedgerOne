using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Returns;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/returns")]
public sealed class ReturnsController : ControllerBase
{
    private readonly ReturnService _service;

    public ReturnsController(ReturnService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ReturnDto>>> GetList(
        [FromQuery] string? keyword,
        [FromQuery] ReturnType? type,
        [FromQuery] ReturnStatus? status,
        [FromQuery] int limit = Paging.DefaultLimit,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.GetListAsync(new ReturnListQuery(keyword, type, status, limit, cursor), cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<ReturnDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ReturnDto>> Create(
        [FromBody] CreateReturnRequest body,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(body, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReturnDto>> Update(
        string id,
        [FromBody] UpdateReturnRequest body,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, body, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        => await _service.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
