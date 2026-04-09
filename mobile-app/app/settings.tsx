import { Redirect } from "expo-router";

import { useMobileApp } from "@/lib/mobile-app-context";

export default function SettingsScreen() {
  const { isSignedIn } = useMobileApp();

  return <Redirect href={isSignedIn ? "/profile" : "/auth/sign-in"} />;
}
