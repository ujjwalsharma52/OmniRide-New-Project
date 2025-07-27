
"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { Button } from "./ui/button";
import { AuthButtons } from "./auth-buttons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Ride" },
    { href: "/driver", label: "Drive" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold">OmniRide</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "transition-colors",
                pathname === link.href
                  ? "text-primary hover:text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
