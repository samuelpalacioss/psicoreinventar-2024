"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

type PayoutType = "cash" | "zelle" | "pago_movil" | "bank_transfer";

export interface PayoutMethod {
  id: number;
  type: PayoutType;
  nickname?: string | null;
  isPreferred: boolean;
  bankName?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
  pagoMovilPhone?: string | null;
  pagoMovilBankCode?: string | null;
  pagoMovilCi?: number | null;
  zelleEmail?: string | null;
  zellePhone?: string | null;
}

interface PayoutCardProps {
  method: PayoutMethod;
}

const PAYOUT_TYPE_ICONS: Record<PayoutType, keyof typeof Icons> = {
  bank_transfer: "bankBuilding",
  zelle: "mail",
  pago_movil: "phone",
  cash: "banknote",
};

function TypeIcon({ type }: { type: PayoutType }) {
  const Icon = Icons[PAYOUT_TYPE_ICONS[type]];
  return <Icon className="size-5 shrink-0" />;
}

function typeLabel(type: PayoutType) {
  if (type === "bank_transfer") return "Bank Transfer";
  if (type === "zelle") return "Zelle";
  if (type === "pago_movil") return "Pago Móvil";
  return "Cash";
}

function mainIdentifier(method: PayoutMethod): string {
  if (method.type === "bank_transfer" && method.accountNumber) {
    return `****${method.accountNumber.slice(-4)}`;
  }
  if (method.type === "zelle") {
    return method.zelleEmail ?? method.zellePhone ?? "—";
  }
  if (method.type === "pago_movil") {
    return method.pagoMovilPhone ?? "—";
  }
  return "In person";
}

function DetailLine({ method }: { method: PayoutMethod }) {
  if (method.type === "bank_transfer") {
    return (
      <span className="text-muted-foreground">
        {method.bankName} · {method.accountType}
      </span>
    );
  }
  if (method.type === "zelle" && method.zellePhone) {
    return <span className="text-muted-foreground">{method.zellePhone}</span>;
  }
  if (method.type === "pago_movil") {
    return (
      <span className="text-muted-foreground">
        Bank {method.pagoMovilBankCode} · CI {method.pagoMovilCi}
      </span>
    );
  }
  return null;
}

export function PayoutCard({ method }: PayoutCardProps) {
  const [isPreferred, setIsPreferred] = useState(method.isPreferred);

  return (
    <Card className="w-full min-w-0 @container/card">
      <CardHeader className="space-y-3 pb-4">
        <CardDescription>{typeLabel(method.type)}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-base font-semibold tabular-nums @[250px]/card:text-lg">
          <TypeIcon type={method.type} />
          {mainIdentifier(method)}
        </CardTitle>
        {/* Reserved height so header stays consistent with or without Preferred badge */}
        <div className="min-h-7 flex items-center justify-end">
          {isPreferred && (
            <CardAction>
              <Badge variant="outline">
                <Icons.starPreferred className="size-3 fill-current" />
                Preferred
              </Badge>
            </CardAction>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardFooter className="flex items-center justify-between gap-4 pt-4 pb-6 text-sm">
        <div className="flex min-w-0 flex-col gap-1">
          {method.nickname && (
            <span className="font-medium">{method.nickname}</span>
          )}
          <DetailLine method={method} />
        </div>
        <ActionsDropdown
          label="Payout method actions"
          triggerIcon="moreVertical"
          triggerIconSize={4}
          className="max-w-xs"
          actions={[
            ...(!isPreferred
              ? [
                {
                  label: "Set as preferred",
                  icon: "starPreferred",
                  onClick: () => setIsPreferred(true),
                } satisfies ActionItem,
              ]
              : []),
            { label: "Edit", icon: "edit", onClick: () => { } },
            {
              label: "Delete",
              icon: "delete",
              variant: "destructive",
              onClick: () => { },
            },
          ] satisfies ActionItem[]}
        />
      </CardFooter>
    </Card>
  );
}
