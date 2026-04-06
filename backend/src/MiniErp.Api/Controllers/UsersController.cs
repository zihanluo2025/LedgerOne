using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Users;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserDirectory _userDirectory;

    public UsersController(IUserDirectory userDirectory)
    {
        _userDirectory = userDirectory;
    }

    [HttpGet]
    public async Task<IActionResult> GetPageList(
        [FromQuery] string? keyword,
        [FromQuery] int? limit,
        [FromQuery] string? cursor,
        CancellationToken cancellationToken)
    {
        var page = await _userDirectory.ListAsync(keyword, limit ?? 50, cursor, cancellationToken);

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
        var page = await _userDirectory.ListAsync(keyword, 1000, null, cancellationToken);

        return Ok(new
        {
            items = page.Items
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _userDirectory.CreateAsync(request, cancellationToken);
        return Created($"/api/users/{id}", new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        await _userDirectory.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        string id,
        CancellationToken cancellationToken)
    {
        await _userDirectory.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}