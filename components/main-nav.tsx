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
                        psicoreinventar
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
                        psicoreinventar
                      </span>
                    </Link>
                  )}
                </div>
                <div className="hidden md:ml-6 md:flex md:gap-6">
                  {items?.length &&
                    items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "inline-flex items-center px-1 pt-1 text-sm font-medium ",
                          isActive(item.href)
                            ? "text-gray-800"
                            : "text-gray-500 transition-colors hover:text-gray-700"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <UserDropdown user={user} />
                ) : (
                  <>
                    <Button
                      asChild
                      className="text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-900"
                    >
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </>
                )}

                <Link
                  href="/specialists"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "hidden md:inline-flex font-semibold bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  Find a therapist
                </Link>
              </div>

              {/* Do not show mobile nav if the user is on the dashboard (instead is used the user dropdown) /}
              {/* Mobile menu button*/}
              {!isOnDashboard ? (
                <div className="-mr-2 flex items-center md:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              ) : null}
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
                          <DisclosureButton
                            as={Link}
                            key={index}
                            href={item.href}
                            className={`block border-l-4 ${
                              isActive(item.href)
                                ? "border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700"
                                : "border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-cream hover:text-gray-700"
                            }`}
                          >
                            {item.title}
                          </DisclosureButton>
                        ))}
                      <div className="flex flex-col items-start border-l-4 gap-y-4 pl-3 pr-4">
                        <Button asChild className="text-sm w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild className="text-sm w-full justify-start bg-indigo-600 hover:bg-indigo-700">
                          <Link href="/specialists">Find a therapist</Link>
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
