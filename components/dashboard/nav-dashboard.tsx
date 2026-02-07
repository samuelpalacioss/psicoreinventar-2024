import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { UserNav } from "@/components/dashboard/user-nav"

export function NavDashboard() {
    return (
        <header className="flex h-16 shrink-0 items-center border-b bg-background rounded-tl-xl transition-[width,height] ease-linear">
            <div className="flex w-full items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-1 mt-2">
                    <SidebarTrigger className="-ml-1 cursor-pointer" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 h-4 data-[orientation=vertical]:h-4"
                    />
                </div>
                <div className="flex items-center">
                    <UserNav />
                </div>
            </div>
        </header>
    )
}
