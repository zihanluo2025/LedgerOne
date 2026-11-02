import type { ApprovalStatus } from "@/types/approval";

export type InboundStatus =
  | "Completed"
  | "Partially Received"
  | "Exception"
  | "Pending";

export type InboundItem = {
  id: string;
  inboundNo: string;
  supplier: string;
  supplierId: string;
  warehouse: string;
  items: number;
  expectedQty: number;
  receivedQty: number;
  date: string;
  status: InboundStatus;
  notes?: string | null;
  approvalStatus?: ApprovalStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInboundRequest = {
  supplierId: string;
  warehouse: string;
  expectedQty: number;
  items: number;
  expectedDate: string;
  notes?: string;
};

export type UpdateInboundRequest = CreateInboundRequest & {
  receivedQty: number;
  hasException: boolean;
};
