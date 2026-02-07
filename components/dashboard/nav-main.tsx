"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    href: string;
    icon?: Icon;
  }[];
}) {

  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} onClick={handleClick}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      "cursor-pointer [&>svg]:h-4.5! [&>svg]:w-4.5! text-gray-700",
                      isActive && "bg-indigo-600/20!",
                    )}
                  >
                    {item.icon && (
                      <item.icon className={`${isActive ? "text-indigo-600" : ""}`} />
                    )}
                    <span className={`font-medium ${isActive ? "text-indigo-600" : ""}`}>
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
