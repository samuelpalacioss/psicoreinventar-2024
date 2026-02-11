"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { appointmentStatusEnum } from "@/src/db/schema";

type AppointmentStatus = typeof appointmentStatusEnum.enumValues[number];

export interface Appointment {
  id: number;
  patientName: string;
  patientCi: number;
  startDateTime: string;
  endDateTime: string;
  serviceName: string;
  status: AppointmentStatus;
  paymentAmount: number;
  notes: string | null;
  cancellationReason: string | null;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/40" },
  confirmed: { label: "Confirmed", className: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40" },
  completed: { label: "Completed", className: "bg-gray-50/50 text-gray-600 border border-gray-200 hover:bg-gray-50/50" },
  cancelled: { label: "Cancelled", className: "bg-rose-200/40 text-gray-900 hover:bg-rose-200/40" },
};

export const appointmentsColumns: ColumnDef<Appointment>[] = [
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
    accessorKey: "patientName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Patient
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">CI: {row.original.patientCi}</span>
          <button
            onClick={() => navigator.clipboard.writeText(row.original.patientCi.toString())}
            className="opacity-50 hover:opacity-100 hover:bg-accent rounded p-0.5 transition-all cursor-pointer"
            aria-label="Copy CI"
          >
            <Icons.copy className="size-3 text-muted-foreground" />
          </button>
        </div>
        <span className="font-medium">{row.original.patientName}</span>
      </div>
    ),
    meta: {
      displayName: "Patient",
    },
    enableHiding: false,
  },
  {
    accessorKey: "startDateTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Date & Time
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const startDate = new Date(row.original.startDateTime);
      const dateStr = startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const timeStr = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return (
        <div className="flex flex-col gap-0.5 py-1">
          <span className="text-sm">{dateStr}</span>
          <span className="text-xs text-muted-foreground">{timeStr}</span>
        </div>
      );
    },
    meta: {
      displayName: "Date & Time",
    },
  },
  {
    accessorKey: "serviceName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Service
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.serviceName}
      </div>
    ),
    meta: {
      displayName: "Service",
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const start = new Date(row.original.startDateTime);
      const end = new Date(row.original.endDateTime);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-sm">
          {durationMinutes} min
        </div>
      );
    },
    meta: {
      displayName: "Duration",
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Status
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status];
      return (
        <Badge className={config.className}>
          {config.label}
        </Badge>
      );
    },
    meta: {
      displayName: "Status",
    },
  },
  {
    accessorKey: "paymentAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Payment
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        ${row.original.paymentAmount.toFixed(2)}
      </div>
    ),
    meta: {
      displayName: "Payment",
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes;
      return (
        <div
          className="text-sm text-muted-foreground max-w-[250px] truncate"
          title={notes || undefined}
        >
          {notes || "—"}
        </div>
      );
    },
    meta: {
      displayName: "Notes",
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isCompleted = row.original.status === "completed";
      const isCancelled = row.original.status === "cancelled";

      return (
        <ActionsDropdown
          actions={[
            {
              label: "View Details",
              icon: "eye",
              onClick: () => console.log("View", row.original.id)
            },
            {
              label: "View Progress",
              icon: "booking",
              onClick: () => console.log("View Progress", row.original.id),
              disabled: !isCompleted
            },
            {
              label: "Reschedule",
              icon: "calendar",
              onClick: () => console.log("Reschedule", row.original.id),
              disabled: isCompleted || isCancelled
            },
            {
              label: "Change Status",
              icon: "edit",
              onClick: () => console.log("Change Status", row.original.id),
              disabled: isCompleted || isCancelled
            },
          ]}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
