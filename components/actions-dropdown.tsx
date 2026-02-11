"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";

export type ActionItem = {
  label: string;
  icon: keyof typeof Icons;
  onClick: () => void;
  variant?: "default" | "destructive";
  separatorBefore?: boolean;
};

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerIcon?: keyof typeof Icons;
  triggerIconSize?: number;
  triggerClassName?: string;
  contentAlign?: "start" | "end" | "center";
  label?: string;
  className?: string;
}

export function ActionsDropdown({
  actions,
  triggerIcon = "ellipsis",
  triggerIconSize = 4,
  triggerClassName,
  contentAlign = "end",
  label = "Acciones",
  className,
}: ActionsDropdownProps) {
  const TriggerIcon = Icons[triggerIcon];

  return (
    <DropdownMenu>
      <DropdownMenuLabel className="sr-only">{label}</DropdownMenuLabel>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8 text-muted-foreground", triggerClassName)}
        >
          <TriggerIcon className={`size-${triggerIconSize}`} />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign} className={className}>
        {actions.map((action, index) => {
          const ActionIcon = Icons[action.icon];
          return (
            <div key={index}>
              {action.separatorBefore && <Separator className="my-2" />}
              <DropdownMenuItem
                onClick={action.onClick}
                className={cn(action.variant === "destructive" && "text-destructive")}
              >
                <ActionIcon className="mr-2 size-4" />
                {action.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
