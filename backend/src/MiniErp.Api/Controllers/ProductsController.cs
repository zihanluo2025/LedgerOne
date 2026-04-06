using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Products;
using MiniErp.Application.Products.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly ICurrentUser _currentUser;

    public ProductsController(
        ProductService productService,
        ICurrentUser currentUser)
    {
        _productService = productService;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _productService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            new { id }
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetAsync(id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpGet]
    public async Task<IActionResult> GetPageList(
        [FromQuery] string? keyword,
        [FromQuery] int? limit,
        [FromQuery] string? cursor,
        CancellationToken cancellationToken)
    {
        var page = await _productService.PageListAsync(
            _currentUser.OrgId,
            keyword,
            limit ?? 50,
            cursor,
            cancellationToken
        );

        return Ok(new
        {
            items = page.Items,
            nextCursor = page.NextCursor
        });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? keyword,
        CancellationToken cancellationToken)
    {
        var items = await _productService.ListAsync(
            keyword,
            1000,
            null,
            cancellationToken
        );

        return Ok(new { items });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        await _productService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        string id,
        CancellationToken cancellationToken)
    {
        await _productService.SoftDeleteAsync(id, cancellationToken);
        return NoContent();
    }
}