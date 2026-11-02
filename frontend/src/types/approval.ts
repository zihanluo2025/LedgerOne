export type ApprovalBusinessType = "Inbound" | "Sales";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Withdrawn";
export type ApprovalAction = "Submit" | "Approve" | "Reject" | "Withdraw";
export type ApprovalScope = "All" | "Pending" | "Completed" | "Mine";

// Must match DashboardService.ApprovalOverdueAfter on the backend.
export const APPROVAL_OVERDUE_HOURS = 48;

export type ApprovalRequest = {
  id: string;
  documentId: string;
  documentNo: string;
  businessType: ApprovalBusinessType;
  summary: string;
  partner: string;
  quantity?: number | null;
  amount?: number | null;
  currency?: string | null;
  location?: string | null;
  requesterId: string;
  requesterName: string;
  status: ApprovalStatus;
  submittedAt: string;
  updatedAt: string;
  processedAt?: string | null;
  processedById?: string | null;
  processedByName?: string | null;
  comment?: string | null;
};

export type ApprovalLog = {
  id: string;
  approvalId: string;
  documentNo: string;
  businessType: ApprovalBusinessType;
  requesterName: string;
  operatorId: string;
  operatorName: string;
  action: ApprovalAction;
  fromStatus?: ApprovalStatus | null;
  toStatus: ApprovalStatus;
  comment?: string | null;
  createdAt: string;
};

export type BatchApprovalResult = {
  approved: number;
  skipped: string[];
};
