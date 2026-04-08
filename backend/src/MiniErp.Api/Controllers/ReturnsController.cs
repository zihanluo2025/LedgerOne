using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Returns;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/returns")]
public class ReturnsController : ControllerBase
{
    private readonly ReturnService _service;

    public ReturnsController(ReturnService service)
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
            new ReturnListQuery(keyword, limit, cursor),
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
    public async Task<ActionResult> Create([FromBody] CreateReturnRequest body)
    {
        try
        {
            var created = await _service.CreateAsync(body);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateReturnRequest body)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, body);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
