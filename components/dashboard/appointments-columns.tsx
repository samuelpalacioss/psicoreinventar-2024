"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { appointmentStatusEnum } from "@/src/db/schema";
import { Service as ServiceLabels } from "@/src/types";

type AppointmentStatus = typeof appointmentStatusEnum.enumValues[number];

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientCi: number;
  doctorName?: string;
  startDateTime: string;
  endDateTime: string;
  serviceName: string;
  status: AppointmentStatus;
  paymentAmount: number;
  notes: string | null;
  progressId: number | null;
  progressTitle: string | null;
  progressLevel: string | null;
  cancellationReason: string | null;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/40" },
  confirmed: { label: "Confirmed", className: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40" },
  completed: { label: "Completed", className: "bg-gray-50/50 text-gray-600 border border-gray-200 hover:bg-gray-50/50" },
  cancelled: { label: "Cancelled", className: "bg-rose-200/40 text-gray-900 hover:bg-rose-200/40" },
};

const progressLevelConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-rose-200/40 text-gray-900 hover:bg-rose-200/40" },
  moderate: { label: "Moderate", className: "bg-amber-200/40 text-gray-900 hover:bg-amber-200/40" },
  good: { label: "Good", className: "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/40" },
  great: { label: "Great", className: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40" },
};

const patientColumn: ColumnDef<Appointment> = {
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
  meta: { displayName: "Patient" },
  enableHiding: false,
};

const doctorColumn: ColumnDef<Appointment> = {
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
    <div className="flex flex-col gap-1 py-1">
      <span className="font-medium">{row.original.doctorName}</span>
    </div>
  ),
  meta: { displayName: "Doctor" },
  enableHiding: false,
};

export interface AppointmentColumnOptions {
  onEdit?: (appointment: Appointment) => void;
  onEditProgress?: (appointment: Appointment) => void;
  onViewProgress?: (appointment: Appointment) => void;
}

export function createAppointmentColumns(
  perspective: "provider" | "client",
  options?: AppointmentColumnOptions
): ColumnDef<Appointment>[] {
  const { onEdit, onEditProgress, onViewProgress } = options ?? {};
  const personColumn = perspective === "client" ? doctorColumn : patientColumn;
  const progressColumn: ColumnDef<Appointment> = {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const hasProgress = Boolean(row.original.progressId);
      const progressLevel = row.original.progressLevel;

      if (!hasProgress) {
        return <span className="text-sm text-muted-foreground">No progress</span>;
      }

      if (!progressLevel) {
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Recorded</Badge>;
      }

      const config = progressLevelConfig[progressLevel] ?? {
        label: progressLevel,
        className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
      };

      return (
        <div
          className="max-w-[220px] truncate"
          title={row.original.progressTitle || undefined}
        >
          <Badge className={config.className}>{config.label}</Badge>
        </div>
      );
    },
    meta: {
      displayName: "Progress",
    },
    enableSorting: false,
  };

  return [
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
    personColumn,
    ...(perspective === "provider" ? [progressColumn] : []),
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
      cell: ({ row }) => {
        const key = row.original.serviceName as keyof typeof ServiceLabels | undefined;
        const label = key && key in ServiceLabels ? ServiceLabels[key] : row.original.serviceName;
        return <div className="text-sm">{label || "—"}</div>;
      },
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
        return (
          <ActionsDropdown
            actions={[
              {
                label: "View Details",
                icon: "eye",
                onClick: () => console.log("View", row.original.id)
              },
              {
                label: "Edit",
                icon: "edit",
                onClick: () => onEdit?.(row.original),
              },
              ...(perspective === "provider"
                ? [{
                    label: "Edit Progress",
                    icon: "edit" as const,
                    onClick: () => onEditProgress?.(row.original),
                    disabled: !row.original.progressId,
                  }]
                : []),
              {
                label: "View Progress",
                icon: "booking",
                onClick: () => onViewProgress?.(row.original),
                disabled: !row.original.progressId
              },
            ]}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export const appointmentsColumns = createAppointmentColumns("provider");
