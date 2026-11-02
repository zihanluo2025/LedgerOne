using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Dashboard;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service)
    {
        _service = service;
    }

    // GET /api/dashboard/summary?days=7
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
        => Ok(await _service.GetSummaryAsync(days, cancellationToken));
}
