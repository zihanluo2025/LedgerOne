using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Approvals.Models;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/approvals")]
public sealed class ApprovalsController : ControllerBase
{
    private readonly ApprovalService _service;

    public ApprovalsController(ApprovalService service)
    {
        _service = service;
    }

    // GET /api/approvals?scope=Pending|Completed|Mine|All
    [HttpGet]
    public async Task<ActionResult<PagedResult<ApprovalRequestDto>>> GetList(
        [FromQuery] ApprovalScope scope = ApprovalScope.All,
        [FromQuery] string? keyword = null,
        [FromQuery] ApprovalBusinessType? businessType = null,
        [FromQuery] ApprovalStatus? status = null,
        [FromQuery] int limit = 200,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.ListAsync(
            new ApprovalListQuery(scope, keyword, businessType, status, limit, cursor),
            cancellationToken));

    [HttpGet("audit")]
    public async Task<ActionResult<PagedResult<ApprovalLogDto>>> GetAuditLogs(
        [FromQuery] string? keyword = null,
        [FromQuery] ApprovalAction? action = null,
        [FromQuery] int limit = 200,
        [FromQuery] string? cursor = null,
        CancellationToken cancellationToken = default)
        => Ok(await _service.ListLogsAsync(new ApprovalLogListQuery(keyword, action, limit, cursor), cancellationToken));

    [HttpGet("{id}")]
    public async Task<ActionResult<ApprovalRequestDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<ApprovalRequestDto>> Approve(
        string id,
        [FromBody] ApprovalDecisionRequest? body,
        CancellationToken cancellationToken)
        => Ok(await _service.ApproveAsync(id, body?.Comment, cancellationToken));

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<ApprovalRequestDto>> Reject(
        string id,
        [FromBody] ApprovalDecisionRequest body,
        CancellationToken cancellationToken)
        => Ok(await _service.RejectAsync(id, body.Comment, cancellationToken));

    [HttpPost("{id}/withdraw")]
    public async Task<ActionResult<ApprovalRequestDto>> Withdraw(string id, CancellationToken cancellationToken)
        => Ok(await _service.WithdrawAsync(id, cancellationToken));

    [HttpPost("batch-approve")]
    public async Task<ActionResult<BatchApprovalResult>> BatchApprove(
        [FromBody] BatchApprovalRequest body,
        CancellationToken cancellationToken)
        => Ok(await _service.BatchApproveAsync(body, cancellationToken));
}
