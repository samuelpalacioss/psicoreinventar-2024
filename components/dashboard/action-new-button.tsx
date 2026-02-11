"use client";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "../ui/button";

interface ActionNewButtonProps {
    label: string;
    icon: keyof typeof Icons;
    onClick?: () => void;
    className?: string;
}

export function ActionNewButton({ label, icon: Icon, onClick, className }: ActionNewButtonProps) {

    const IconComponent = Icons[Icon];

    return (
        <Button className={cn(buttonVariants({ variant: "default" }), `gap-0 ${className}`)} onClick={onClick}>

            <IconComponent className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
}