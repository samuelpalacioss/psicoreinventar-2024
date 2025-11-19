"use client";
import { cn } from "@/lib/utils";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "./ui/button";
import { MainNavItem } from "@/types";
import { User } from "next-auth";
import UserDropdown from "./user-dropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: MainNavItem[];
  children?: React.ReactNode;
  user?: Pick<User, "name" | "image" | "email">;
}

export default function Navbar({ className, items, user, children }: NavbarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;
  const isOnDashboard = pathname.includes("/dashboard");

  return (
    <Disclosure as="nav" className="border-b">
      {({ open }) => (
        <>
          <div className={cn("mx-auto max-w-7xl px-4 sm:px-6", className)}>
            <div className="flex h-16 items-center justify-between">
              <div className="flex">
                <div className="flex shrink-0">
                  {/* If mobile nav open, close it, otherwise simple link */}
                  {open ? (
                    <DisclosureButton
                      as={Link}
                      href={"/"}
                      className="text-xl font-extrabold tracking-tight text-primary hover:text-primary/90 flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Inter', 'sans-serif'",
                        letterSpacing: "-0.04em",
                        userSelect: "none",
                      }}
                      aria-label="Psicoreinventar Logo"
                    >
                      <span
                        className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-400 bg-clip-text text-transparent"
                        style={{
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          display: "inline-block",
                        }}
                      >
                        Psicoreinventar
                      </span>
                    </DisclosureButton>
                  ) : (
                    <Link
                      href={"/"}
                      className="text-xl font-extrabold tracking-tight text-primary hover:text-primary/90 flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Inter', 'sans-serif'",
                        letterSpacing: "-0.04em",
                        userSelect: "none",
                      }}
                      aria-label="Psicoreinventar Logo"
                    >
                      <span
                        className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-400 bg-clip-text text-transparent"
                        style={{
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          display: "inline-block",
                        }}
                      >
                        Psicoreinventar
                      </span>
                    </Link>
                  )}
                </div>
                <div className="hidden md:ml-6 md:flex md:gap-6">
                  {/* Moving the dropdown menu further down to make it less intrusive */}
                  <NavigationMenu className="[&>div:last-child]:!mt-5">
                    <NavigationMenuList>
                      {items?.length &&
                        items.map((link, index) => (
                          <NavigationMenuItem key={index}>
                            {link.submenu ? (
                              <>
                                <NavigationMenuTrigger className="bg-transparent h-auto inline-flex items-center px-1 pt-1 pb-1 text-sm font-medium text-muted-foreground hover:text-primary *:[svg]:-me-0.5 *:[svg]:size-3.5">
                                  {link.label}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="z-50 p-3 bg-white border border-gray-100 shadow-lg rounded-lg data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16!">
                                  <div>
                                    <ul
                                      className={cn(
                                        link.type === "description" ? "min-w-72 space-y-1" : "min-w-56 space-y-1"
                                      )}
                                    >
                                      {link.items?.map((item, itemIndex) => (
                                        <li key={itemIndex}>
                                          <NavigationMenuLink asChild>
                                            <Link
                                              href={item.href}
                                              className="group block select-none rounded-md py-2.5 px-3.5 text-sm font-medium leading-none no-underline outline-none transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 relative overflow-hidden"
                                            >
                                              <span className="relative z-10 flex items-center gap-2">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-indigo-600 transition-colors duration-200"></span>
                                                {item.label}
                                              </span>
                                              <span className="absolute inset-0 bg-linear-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0"></span>
                                            </Link>
                                          </NavigationMenuLink>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </NavigationMenuContent>
                              </>
                            ) : (
                              <NavigationMenuLink asChild>
                                <Link
                                  href={link.href || "#"}
                                  className={cn(
                                    "inline-flex items-center px-1 pt-1 pb-1 text-sm font-medium",
                                    isActive(link.href || "")
                                      ? "text-gray-800"
                                      : "text-gray-500 transition-colors hover:text-gray-700"
                                  )}
                                >
                                  {link.label}
                                </Link>
                              </NavigationMenuLink>
                            )}
                          </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {user ? (
                  <UserDropdown user={user} />
                ) : (
                  <>
                    <Button
                      asChild
                      className="text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-900"
                    >
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Link
                      href="/find"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "hidden md:inline-flex font-semibold bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      Find a therapist
                    </Link>
                  </>
                )}
                {/* Mobile menu button - only show if not on dashboard */}
                {!isOnDashboard && (
                  <div className="flex items-center md:hidden">
                    <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </DisclosureButton>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Mobile menu */}
          {!isOnDashboard ? (
            <AnimatePresence>
              {open && (
                <DisclosurePanel className="md:hidden overflow-hidden" static>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1 pb-3 pt-2">
                      <ul>
                        {items?.length &&
                          items.map((item, index) => (
                            <li key={index}>
                              {item.submenu ? (
                                <div>
                                  <div className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500">
                                    {item.label}
                                  </div>
                                  <ul className="pl-6 space-y-1">
                                    {item.items?.map((subItem, subIndex) => (
                                      <li key={subIndex}>
                                        <DisclosureButton
                                          as={Link}
                                          href={subItem.href}
                                          className={`block border-l-4 ${
                                            isActive(subItem.href)
                                              ? "border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700"
                                              : "border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-cream hover:text-gray-700"
                                          }`}
                                        >
                                          {subItem.label}
                                        </DisclosureButton>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <DisclosureButton
                                  as={Link}
                                  href={item.href || "#"}
                                  className={`block border-l-4 ${
                                    isActive(item.href || "")
                                      ? "border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700"
                                      : "border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-cream hover:text-gray-700"
                                  }`}
                                >
                                  {item.label}
                                </DisclosureButton>
                              )}
                            </li>
                          ))}
                        <div className="flex flex-col items-start border-l-4 gap-y-4 pl-3 pr-4">
                          <Button
                            asChild
                            className="text-sm w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Link href="/login">Log in</Link>
                          </Button>
                          <Button
                            asChild
                            className="text-sm w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Link href="/find">Find a therapist</Link>
                          </Button>
                        </div>
                      </ul>
                    </div>
                  </motion.div>
                </DisclosurePanel>
              )}
            </AnimatePresence>
          ) : null}
        </>
      )}
    </Disclosure>
  );
}
