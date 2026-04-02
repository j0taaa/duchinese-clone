"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function UserMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden rounded-full border border-[#ecdcd2] bg-white/90 px-4 py-2 text-right shadow-sm sm:block">
        <p className="text-sm font-semibold text-[#2b201c]">{name}</p>
        <p className="text-xs text-[#7f736d]">{email}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-full border-[#eadcd2] bg-white/90 px-4 text-[#2b201c] hover:bg-[#f9f4ef]"
        onClick={handleSignOut}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        Sign out
      </Button>
    </div>
  );
}
