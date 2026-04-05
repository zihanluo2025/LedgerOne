"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Plus,
    RefreshCw,
    MoreHorizontal,
    Users,
    UserCheck,
    ShieldCheck,
    Mail,
    Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = "Admin" | "Manager" | "Staff";
type UserStatus = "Active" | "Pending" | "Inactive" | "Suspended";

type UserItem = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    employeeId: string;
    department: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string;
    createdAt: string;
};

const users: UserItem[] = [
    {
        id: "1",
        name: "Alexander Wright",
        email: "alex.wright@executive.com",
        avatar: "AW",
        employeeId: "#ERP-20941",
        department: "Finance",
        role: "Admin",
        status: "Active",
        lastLogin: "2 mins ago",
        createdAt: "Oct 24, 2023",
    },
    {
        id: "2",
        name: "Sarah Jenkins",
        email: "s.jenkins@executive.com",
        avatar: "SJ",
        employeeId: "#ERP-21002",
        department: "Sales",
        role: "Manager",
        status: "Pending",
        lastLogin: "Never",
        createdAt: "Nov 12, 2023",
    },
    {
        id: "3",
        name: "Michael Chen",
        email: "m.chen@executive.com",
        avatar: "MC",
        employeeId: "#ERP-20855",
        department: "Operations",
        role: "Staff",
        status: "Inactive",
        lastLogin: "15 days ago",
        createdAt: "Sep 05, 2023",
    },
    {
        id: "4",
        name: "Eleanor Young",
        email: "e.young@executive.com",
        avatar: "EY",
        employeeId: "#ERP-21116",
        department: "HR",
        role: "Manager",
        status: "Active",
        lastLogin: "30+ days ago",
        createdAt: "May 19, 2023",
    },
    {
        id: "5",
        name: "Daniel Foster",
        email: "d.foster@executive.com",
        avatar: "DF",
        employeeId: "#ERP-20710",
        department: "Inventory",
        role: "Staff",
        status: "Suspended",
        lastLogin: "7 days ago",
        createdAt: "Mar 08, 2023",
    },
    {
        id: "6",
        name: "Olivia Brown",
        email: "o.brown@executive.com",
        avatar: "OB",
        employeeId: "#ERP-21088",
        department: "Finance",
        role: "Staff",
        status: "Active",
        lastLogin: "1 hour ago",
        createdAt: "Jan 16, 2024",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
            {name}
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const map: Record<UserRole, string> = {
        Admin: "bg-blue-50 text-blue-600",
        Manager: "bg-violet-50 text-violet-600",
        Staff: "bg-slate-100 text-slate-600",
    };

    return (
        <span className={cn("rounded px-2 py-1 text-xs font-semibold uppercase", map[role])}>
            {role}
        </span>
    );
}

function StatusBadge({ status }: { status: UserStatus }) {
    const map: Record<UserStatus, string> = {
        Active: "text-emerald-600",
        Pending: "text-orange-500",
        Inactive: "text-slate-500",
        Suspended: "text-rose-600",
    };

    const dotMap: Record<UserStatus, string> = {
        Active: "bg-emerald-500",
        Pending: "bg-orange-400",
        Inactive: "bg-slate-400",
        Suspended: "bg-rose-500",
    };

    return (
        <div className={cn("flex items-center gap-2 text-sm font-medium", map[status])}>
            <span className={cn("h-2 w-2 rounded-full", dotMap[status])} />
            <span>{status}</span>
        </div>
    );
}

function UserActions({ user }: { user: UserItem }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit User</DropdownMenuItem>
                <DropdownMenuItem>Reset Password</DropdownMenuItem>

                <DropdownMenuSeparator />

                {user.status === "Inactive" || user.status === "Suspended" ? (
                    <DropdownMenuItem>Enable User</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>Disable User</DropdownMenuItem>
                )}

                {user.status === "Pending" ? (
                    <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                ) : null}

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [status, setStatus] = useState("all");
    const [department, setDepartment] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 6;

    const filtered = useMemo(() => {
        const keyword = search.toLowerCase();

        return users.filter((u) => {
            const matchesKeyword =
                u.name.toLowerCase().includes(keyword) ||
                u.email.toLowerCase().includes(keyword) ||
                u.employeeId.toLowerCase().includes(keyword);

            const matchesRole = role === "all" || u.role.toLowerCase() === role;
            const matchesStatus = status === "all" || u.status.toLowerCase() === status;
            const matchesDepartment =
                department === "all" || u.department.toLowerCase() === department;

            return matchesKeyword && matchesRole && matchesStatus && matchesDepartment;
        });
    }, [search, role, status, department]);

    const totalPages = Math.ceil(filtered.length / pageSize);

    const paged = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            placeholder: "Search name, email, employee ID...",
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
        },
        {
            key: "role",
            type: "select",
            label: "Role",
            value: role,
            onChange: (value) => {
                setRole(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Roles", value: "all" },
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Staff", value: "staff" },
            ],
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            value: status,
            onChange: (value) => {
                setStatus(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
            ],
        },
        {
            key: "department",
            type: "select",
            label: "Department",
            value: department,
            onChange: (value) => {
                setDepartment(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Departments", value: "all" },
                { label: "Finance", value: "finance" },
                { label: "Sales", value: "sales" },
                { label: "Operations", value: "operations" },
                { label: "HR", value: "hr" },
                { label: "Inventory", value: "inventory" },
            ],
        },
    ];

    const columns = [
        {
            key: "user",
            title: "User",
            render: (u: UserItem) => (
                <div className="flex items-center gap-3">
                    <Avatar name={u.avatar} />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{u.name}</p>
                        <p className="truncate text-sm text-[#175CFF]">{u.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "employeeId",
            title: "ID",
            render: (u: UserItem) => (
                <span className="font-semibold text-[#175CFF]">{u.employeeId}</span>
            ),
        },
        {
            key: "department",
            title: "Department",
            render: (u: UserItem) => u.department,
        },
        {
            key: "role",
            title: "Role",
            render: (u: UserItem) => <RoleBadge role={u.role} />,
        },
        {
            key: "status",
            title: "Status",
            render: (u: UserItem) => <StatusBadge status={u.status} />,
        },
        {
            key: "lastLogin",
            title: "Last Login",
            render: (u: UserItem) => u.lastLogin,
        },
        {
            key: "createdAt",
            title: "Created At",
            render: (u: UserItem) => u.createdAt,
        },
        {
            key: "actions",
            title: "Actions",
            render: (u: UserItem) => <UserActions user={u} />,
        },
    ];

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "Active").length;
    const adminUsers = users.filter((u) => u.role === "Admin").length;
    const pendingInvitations = users.filter((u) => u.status === "Pending").length;

    const resetFilters = () => {
        setSearch("");
        setRole("all");
        setStatus("all");
        setDepartment("all");
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen space-y-6 bg-[#F6F8FC]">
            <PageHeader
                title="Users"
                description="Manage user accounts, roles, status and access permissions."
                actions={[
                    {
                        label: "Import",
                        icon: <Upload size={22} strokeWidth={2.2} />,
                        onClick: () => console.log("Import clicked")
                    },
                    {
                        label: "Export",
                        icon: <Download size={22} strokeWidth={2.2} />,
                        onClick: () => console.log("Export clicked")
                    },
                    {
                        label: "Add User",
                        icon: <Plus size={22} strokeWidth={2.2} />,
                        onClick: () => console.log("Add User clicked")
                    },
                ]}
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    title="Total Users"
                    value={totalUsers.toLocaleString()}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    trend={{ value: "+12% from last month", positive: true }}
                />
                <KpiCard
                    title="Active Users"
                    value={activeUsers.toLocaleString()}
                    icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
                    description={`${((activeUsers / totalUsers) * 100).toFixed(1)}% of total directory`}
                />
                <KpiCard
                    title="Admins"
                    value={adminUsers.toLocaleString()}
                    icon={<ShieldCheck className="h-5 w-5 text-indigo-600" />}
                    description="Privileged access accounts"
                />
                <KpiCard
                    title="Pending Invitations"
                    value={pendingInvitations.toLocaleString()}
                    icon={<Mail className="h-5 w-5 text-orange-500" />}
                    description="Requires action"
                />
            </div>

            <DataFilterBar
                fields={filterFields}
                actionSlot={
                    <Button
                        variant="ghost"
                        className="text-[#175CFF] hover:bg-blue-50 hover:text-[#175CFF]"
                        onClick={resetFilters}
                    >
                        Reset
                    </Button>
                }
            />

            <DataTable
                data={paged}
                columns={columns}
                rowKey={(u: UserItem) => u.id}
                pagination={{
                    currentPage,
                    totalPages,
                    totalItems: filtered.length,
                    pageSize,
                    onPageChange: setCurrentPage,
                }}
                selectable
            />
        </div>
    );
}