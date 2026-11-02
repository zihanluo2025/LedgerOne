namespace MiniErp.Application.Approvals;

public enum ApprovalBusinessType
{
    Inbound,
    Sales
}

public enum ApprovalStatus
{
    Pending,
    Approved,
    Rejected,
    Withdrawn
}

public enum ApprovalAction
{
    Submit,
    Approve,
    Reject,
    Withdraw
}
