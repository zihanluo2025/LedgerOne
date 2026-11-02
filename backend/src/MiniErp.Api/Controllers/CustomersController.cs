using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Customers;
using MiniErp.Application.Customers.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly CustomerService _service;

    public CustomersController(CustomerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetList(
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] string? segment,
        [FromQuery] int limit = Paging.DefaultLimit,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.GetCustomersAsync(
            new CustomerListQuery(keyword, status, segment, limit, cursor),
            cancellationToken));

    [HttpGet("summary")]
    public async Task<ActionResult<CustomerSummaryDto>> GetSummary(CancellationToken cancellationToken)
        => Ok(await _service.GetSummaryAsync(cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(
        [FromBody] CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> Update(
        string id,
        [FromBody] UpdateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
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
