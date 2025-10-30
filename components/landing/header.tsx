"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "@/lib/auth-client";
import type { NavLink } from "@/lib/landing-data";

type LandingHeaderProps = {
  navLinks: NavLink[];
};

export function LandingHeader({ navLinks }: LandingHeaderProps) {
  const { data: session, isPending } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userDisplayName = useMemo(() => {
    if (!session?.user) {
      return null;
    }

    return session.user.name || session.user.email || "User";
  }, [session?.user]);

  const userInitial = useMemo(() => {
    if (!session?.user) {
      return "?";
    }

    const source = session.user.name || session.user.email || "?";
    return source.substring(0, 1).toUpperCase();
  }, [session?.user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAuthenticated = !!session?.user;

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
            M
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">MeetMe</p>
            <p className="text-sm text-muted-foreground">
              Scheduling without the friction
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <Button key={item.label} variant="ghost" asChild size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/60 px-3 py-1.5">
                <Avatar className="size-8">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={userDisplayName ?? "User avatar"}
                  />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {userDisplayName}
                  </span>
                  {session.user.email ? (
                    <span className="text-xs text-muted-foreground leading-tight">
                      {session.user.email}
                    </span>
                  ) : null}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="#get-started">Start for free</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <Button asChild size="sm" className="px-4">
            <Link href="#get-started">Start for free</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-xs px-4 sm:max-w-sm sm:px-6">
              <div className="flex flex-col gap-6 pt-6">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Menu</p>
                  <p className="text-sm text-muted-foreground">
                    Jump to any section or manage your account.
                  </p>
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Button
                        variant="ghost"
                        asChild
                        className="justify-start px-3"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </Button>
                    </SheetClose>
                  ))}
                </nav>
                {isPending ? (
                  <div className="text-sm text-muted-foreground">
                    Loading session…
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={session.user.image ?? undefined}
                          alt={userDisplayName ?? "User avatar"}
                        />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium leading-tight">
                          {userDisplayName}
                        </span>
                        {session.user.email ? (
                          <span className="text-sm text-muted-foreground leading-tight">
                            {session.user.email}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        variant="outline"
                      >
                        {isSigningOut ? "Signing out…" : "Sign out"}
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="#get-started">Start for free</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
