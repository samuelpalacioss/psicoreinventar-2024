"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ActionsDropdown } from "@/components/actions-dropdown";

export interface Patient {
  id: number;
  ci: number;
  name: string;
  birthDate: string;
  age: number;
  phone: string;
  email: string;
  totalSessions: number;
  totalBilled: number;
  lastAppointment: string | null;
  filesCount: number;
}

export const patientsColumns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="cursor-pointer"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        className="cursor-pointer"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Patient Name
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">CI: {row.original.ci}</span>
          <button
            onClick={() => navigator.clipboard.writeText(row.original.ci.toString())}
            className="hover:bg-black/5 cursor-pointer"
            aria-label="Copy CI"
          >
            <Icons.copy className="size-3.5 text-muted-foreground" />
          </button>
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
    meta: {
      displayName: "Patient Name",
    },
    enableHiding: false,
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Age
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-sm">{row.original.age} years</div>,
    meta: {
      displayName: "Age",
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-sm">{row.original.phone}</div>,
    meta: {
      displayName: "Phone",
    },
    enableSorting: false,
  },
  {
    accessorKey: "totalSessions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Sessions
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-sm">{row.original.totalSessions}</div>,
    meta: {
      displayName: "Sessions",
    },
  },
  {
    accessorKey: "totalBilled",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Total Billed
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-sm">${row.original.totalBilled.toFixed(2)}</div>,
    meta: {
      displayName: "Total Billed",
    },
  },
  {
    accessorKey: "lastAppointment",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Last Appointment
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.lastAppointment
          ? new Date(row.original.lastAppointment).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
          : "No appointments"}
      </div>
    ),
    meta: {
      displayName: "Last Appointment",
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Email
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
    meta: {
      displayName: "Email",
    },
  },
  {
    accessorKey: "filesCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Files
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">{row.original.filesCount}</span>
        <span className="text-sm text-muted-foreground">files</span>
        <Icons.file className="size-4 text-muted-foreground cursor-pointer hover:bg-black/5" />
      </div>
    ),
    meta: {
      displayName: "Files",
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsDropdown
        actions={[
          { label: "View", icon: "eye", onClick: () => console.log("View", row.original.id) },
          { label: "View Progress", icon: "booking", onClick: () => console.log("View Progress", row.original.id) },
          { label: "Schedule", icon: "calendar", onClick: () => console.log("Schedule", row.original.id) },
          { label: "Edit", icon: "edit", onClick: () => console.log("Edit", row.original.id) },
          { label: "Delete", icon: "delete", onClick: () => console.log("Delete", row.original.id), variant: "destructive", separatorBefore: true },
        ]}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
