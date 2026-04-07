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
};

export type InboundListResponse = {
  items: InboundItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  nextCursor?: string | null;
};

export type CreateInboundRequest = {
  supplierId: string;
  warehouse: string;
  expectedQty: number;
  items: number;
  expectedDate: string;
  notes?: string;
};

export type CreateInboundFormValues = {
  supplierId: string;
  warehouse: string;
  expectedQty: string;
  items: string;
  expectedDate: string;
  notes: string;
};