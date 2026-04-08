export type ReturnType = "Customer" | "Supplier";
export type ReturnStatus = "Inspecting" | "Completed" | "Rejected";

export type ReturnRecord = {
  id: string;
  returnNo: string;
  type: ReturnType;
  partnerName: string;
  partnerRole: string;
  partnerInitials: string;
  productName: string;
  productMeta: string;
  qty: number;
  requestedAt: string;
  status: ReturnStatus;
  createdAt: string;
};

export type CreateReturnRequest = {
  type: ReturnType;
  partnerName: string;
  partnerRole: string;
  productName: string;
  productMeta: string;
  qty: number;
  status?: ReturnStatus | null;
};

export type UpdateReturnRequest = {
  type: ReturnType;
  partnerName: string;
  partnerRole: string;
  productName: string;
  productMeta: string;
  qty: number;
  status: ReturnStatus;
};
