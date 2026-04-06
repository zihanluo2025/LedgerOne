using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/suppliers")]
public sealed class SuppliersController : ControllerBase
{
    private readonly SupplierService _supplierService;

    public SuppliersController(SupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SupplierDto>>> GetSuppliers(
        [FromQuery] SupplierListQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetSuppliersAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetSuppliersAsync(
            new SupplierListQuery
            {
                Limit = 1000,
                Cursor = null
            },
            cancellationToken
        );

        return Ok(new { items = result.Items });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<SupplierSummaryDto>> GetSummary(
        CancellationToken cancellationToken)
    {
        var result = await _supplierService.GetSummaryAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var supplier = await _supplierService.GetByIdAsync(id, cancellationToken);

        if (supplier is null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> Create(
        [FromBody] CreateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _supplierService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierDto>> Update(
        string id,
        [FromBody] UpdateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _supplierService.UpdateAsync(id, request, cancellationToken);

        if (updated is null)
        {
            return NotFound();
        }

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        string id,
        CancellationToken cancellationToken)
    {
        var deleted = await _supplierService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete(
        [FromBody] BulkDeleteSuppliersRequest request,
        CancellationToken cancellationToken)
    {
        await _supplierService.BulkDeleteAsync(request.Ids, cancellationToken);
        return NoContent();
    }
}