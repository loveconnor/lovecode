"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatActions, useChatReset } from "loveui-ai-tools/client";
import {
  BoltIcon,
  BookOpenIcon,
  ChevronDownIcon,
  Layers2Icon,
  Loader2,
  LogOutIcon,
  Menu,
  PinIcon,
  Settings,
  UserPenIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/building-blocks/default/ui/avatar";
import { Button } from "@/registry/building-blocks/default/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/building-blocks/default/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-client";
import type { AppUser } from "@/types/auth";

interface HeaderProps {
  user: AppUser;
  onToggleHistory?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({
  onToggleHistory,
  user,
  isSidebarOpen = false,
}: HeaderProps) {
  const reset = useChatReset();
  const { stop } = useChatActions();

  const handleReset = () => {
    stop();
    reset();
  };

  return (
    <>
      <div className="fixed top-6 left-6 z-[60] flex items-center gap-2">
        {onToggleHistory && !isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleHistory}
            className="cursor-pointer transition-opacity hover:opacity-80 p-2 hover:bg-accent rounded-lg"
            aria-label="Toggle chat history"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="fixed top-6 right-6 z-[60] flex items-center gap-4">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </>
  );
}

function UserMenu({ user }: { user: AppUser }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = user.email
    .split("@")[0]
    ?.slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent flex items-center gap-2"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={user.email} />
            <AvatarFallback className="bg-primary/10 text-sm font-medium uppercase">
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                initials || "U"
              )}
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon size={16} className="opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleSettings();
            }}
          >
            <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
        >
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
