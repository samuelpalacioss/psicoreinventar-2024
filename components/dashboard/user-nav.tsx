import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { signOutAction } from "@/actions/auth"

interface UserNavProps {
    user: {
        name: string | null
        email: string | null
        image?: string | null
    }
}

export function UserNav({ user }: UserNavProps) {
    const name = user.name ?? "User"
    const email = user.email ?? "No email"
    const image = user.image ?? null
    const userInitials = name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-fit rounded-full flex items-center justify-start gap-3 pl-2 pr-0 md:pr-4 hover:bg-inherit">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={image ?? undefined} alt="user avatar" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>

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
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <form action={signOutAction}>
                    <DropdownMenuItem asChild>
                        <button type="submit" className="w-full flex items-center cursor-pointer">
                            Sign out
                            <Icons.logout className="w-4 h-4 ml-2" />
                        </button>
                    </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
