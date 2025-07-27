import Link from "next/link";
import { Button } from "./ui/button";

export function AuthButtons() {
  // In a real app, you'd have logic here to show user avatar/menu if logged in
  const isLoggedIn = false;

  if (isLoggedIn) {
    // Placeholder for logged-in user state
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}
