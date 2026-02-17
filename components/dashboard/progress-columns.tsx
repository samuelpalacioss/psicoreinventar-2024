"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { Badge } from "@/components/ui/badge";

export interface Progress {
  id: number;
  doctorName: string;
  appointmentId: number | null;
  conditionName: string | null;
  title: string;
  level: string | null;
  notes: string | null;
  createdAt: string;
}

const levelConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-rose-200/40 text-gray-900 hover:bg-rose-200/40" },
  moderate: { label: "Moderate", className: "bg-amber-200/40 text-gray-900 hover:bg-amber-200/40" },
  good: { label: "Good", className: "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/40" },
  great: { label: "Great", className: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40" },
};

export const progressColumns: ColumnDef<Progress>[] = [
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
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Title
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="font-medium">{row.original.title}</span>
        {row.original.conditionName && (
          <span className="text-xs text-muted-foreground">{row.original.conditionName}</span>
        )}
      </div>
    ),
    meta: { displayName: "Title" },
    enableHiding: false,
  },
  {
    accessorKey: "doctorName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Doctor
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.doctorName}</div>
    ),
    meta: { displayName: "Doctor" },
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Level
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const level = row.original.level;
      if (!level) return <span className="text-muted-foreground text-sm">—</span>;
      const config = levelConfig[level] ?? {
        label: level,
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };
      return <Badge className={config.className}>{config.label}</Badge>;
    },
    meta: { displayName: "Level" },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Date
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return <div className="text-sm">{dateStr}</div>;
    },
    meta: { displayName: "Date" },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes;
      return (
        <div
          className="text-sm text-muted-foreground max-w-[280px] truncate"
          title={notes || undefined}
        >
          {notes || "—"}
        </div>
      );
    },
    meta: { displayName: "Notes" },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsDropdown
        actions={[
          {
            label: "View Details",
            icon: "eye",
            onClick: () => console.log("View", row.original.id),
          },
          {
            label: "View Session",
            icon: "booking",
            onClick: () => console.log("View Session", row.original.id),
            disabled: row.original.appointmentId === null,
          },
        ]}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
