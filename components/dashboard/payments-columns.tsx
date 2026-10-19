"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { payoutTypeEnum } from "@/src/db/schema";
import { PaymentStatus } from "@/src/types";

type PayoutType = typeof payoutTypeEnum.enumValues[number];

export interface Payment {
  id: number;
  date: string;
  amount: number;
  doctorName: string;
  serviceName: string;
  paymentType: PayoutType;
  paymentDetails: string; // e.g. "•••• 4242", "+58 412 5551234", "Bank XYZ", "—"
  paymentNickname: string;
  status: PaymentStatus;
}

const paymentTypeConfig: Record<PayoutType, { label: string; className: string }> = {
  cash: {
    label: "Cash",
    className: "bg-amber-200/40 text-gray-900 hover:bg-amber-200/40",
  },
  zelle: {
    label: "Zelle",
    className: "bg-violet-200/40 text-gray-900 hover:bg-violet-200/40",
  },
  pago_movil: {
    label: "Pago Móvil",
    className: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40",
  },
  bank_transfer: {
    label: "Bank Transfer",
    className: "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/40",
  },
};

const paymentStatusClassName: Record<PaymentStatus, string> = {
  pending: "bg-amber-200/40 text-gray-900 hover:bg-amber-200/40",
  paid: "bg-emerald-200/40 text-gray-900 hover:bg-emerald-200/40",
};

export const PaymentType = {
  cash: "Cash",
  zelle: "Zelle",
  pago_movil: "Pago Móvil",
  bank_transfer: "Bank Transfer",
} as const satisfies Record<(typeof payoutTypeEnum.enumValues)[number], string>;

export const paymentsColumns: ColumnDef<Payment>[] = [
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
    accessorKey: "date",
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
      const date = new Date(row.original.date);
      const dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return <div className="py-1 text-sm">{dateStr}</div>;
    },
    meta: { displayName: "Date" },
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
      <div className="py-1 font-medium">{row.original.doctorName}</div>
    ),
    meta: { displayName: "Doctor" },
    enableHiding: false,
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
      <div className="py-1 text-sm">{row.original.serviceName}</div>
    ),
    meta: { displayName: "Service" },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        Amount
        <Icons.sort className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="py-1 text-sm font-medium">${row.original.amount.toFixed(2)}</div>
    ),
    meta: { displayName: "Amount" },
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <Badge className={`inline-flex w-20 justify-center px-2 py-0.5 ${paymentStatusClassName[row.original.status]}`}>
        {PaymentStatus[row.original.status]}
      </Badge>
    ),
    meta: { displayName: "Status" },
    enableSorting: false,
  },
  {
    accessorKey: "paymentType",
    header: () => <div>Payment Method</div>,
    cell: ({ row }) => {
      const config = paymentTypeConfig[row.original.paymentType];
      return (
        <div className="flex max-w-[200px] flex-col gap-1 py-1">
          <Badge className={`inline-flex w-28 justify-center px-2 py-0.5 text-center ${config.className}`}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground wrap-break-word">
            {row.original.paymentNickname} · {row.original.paymentDetails}
          </span>
        </div>
      );
    },
    meta: { displayName: "Payment Method" },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsDropdown
        actions={[
          {
            label: "View Receipt",
            icon: "file",
            onClick: () => console.log("View Receipt", row.original.id),
          },
          {
            label: "View Appointment",
            icon: "calendar",
            onClick: () => console.log("View Appointment", row.original.id),
          },
        ]}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
