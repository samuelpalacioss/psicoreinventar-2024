import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"

export function UserNav() {
    const user = {
        name: "Valentina Varela",
        email: "valen123@gmail.com",
        image: "url",
    }
    const { name, email, image } = user; // TODO: Get user from session
    const userInitials = name.split(" ").map((n) => n[0]).join("");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-fit rounded-full flex items-center justify-start gap-3 pl-2 pr-0 md:pr-4 hover:bg-inherit">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={image} alt="user avatar" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start text-sm">
                        <span className="font-semibold text-cue-deep-green text-base">{name}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-xs leading-none text-muted-foreground">
                            {email}
                        </p>
                        <p className="text-sm font-medium text-cue-deep-green leading-none">{name}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Ajustes
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuItem className="flex items-center">
                    Cerrar sesión
                    <Icons.logout className="w-4 h-4 ml-2" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
