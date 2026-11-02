using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/suppliers")]
public sealed class SuppliersController : ControllerBase
{
    private readonly SupplierService _service;

    public SuppliersController(SupplierService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SupplierDto>>> GetList(
        [FromQuery] SupplierListQuery query,
        CancellationToken cancellationToken)
        => Ok(await _service.GetSuppliersAsync(query, cancellationToken));

    [HttpGet("all")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetSuppliersAsync(
            new SupplierListQuery { Limit = Paging.MaxLimit },
            cancellationToken);

        return Ok(new { items = result.Items });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<SupplierSummaryDto>> GetSummary(CancellationToken cancellationToken)
        => Ok(await _service.GetSummaryAsync(cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var supplier = await _service.GetByIdAsync(id, cancellationToken);
        return supplier is null ? NotFound() : Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> Create(
        [FromBody] CreateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierDto>> Update(
        string id,
        [FromBody] UpdateSupplierRequest request,
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
