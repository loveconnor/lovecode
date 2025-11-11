"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User2, X, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const topNavigation = [
  { name: "Home", href: "/" },
  { name: "Chats", href: "/" },
  { name: "Settings", href: "/settings" },
];

const secondaryNavigation = [
  { name: "General", href: "/settings", icon: User2 },
  { name: "Integrations", href: "/settings/integrations", icon: Boxes },
];

interface SettingsShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function SettingsShell({ userEmail, children }: SettingsShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2 rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-6" />
            </Link>
          </div>
          <nav className="hidden md:flex md:gap-8 md:text-sm md:font-semibold md:text-muted-foreground">
            {topNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition hover:text-foreground",
                  pathname === item.href && "text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo className="h-6" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold",
                    pathname === item.href
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 lg:flex lg:gap-16 lg:px-8">
        <aside className="flex overflow-x-auto border-b border-border/60 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-10">
          <nav className="flex-none px-1 lg:px-0">
            <ul className="flex gap-2 whitespace-nowrap lg:flex-col">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex gap-3 rounded-md px-3 py-2 text-sm font-semibold",
                      pathname === item.href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === item.href
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 py-10 lg:py-12">
          <div className="mx-auto max-w-3xl space-y-16 lg:max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
