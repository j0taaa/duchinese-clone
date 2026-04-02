import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getServerSession();

  redirect(session ? "/profile" : "/sign-in");
}
