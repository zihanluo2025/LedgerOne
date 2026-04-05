import { ReactNode } from "react";

export type DataTableColumn<T> = {
    key: string;
    title: ReactNode;
    render: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    width?: number | string;
    fixed?: "left" | "right";
};

export type DataTablePagination = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
};

export type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: (row: T) => string;
    selectable?: boolean;
    selectedRowKeys?: string[];
    onSelectRow?: (key: string) => void;
    onSelectAll?: (checked: boolean) => void;
    allChecked?: boolean;
    emptyText?: string;
    pagination?: DataTablePagination;
    rowClassName?: (row: T) => string | undefined;
    footerLeft?: ReactNode;
};