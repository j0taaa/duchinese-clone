import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MobileAppProvider } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/sign-in" options={{ title: "Sign In" }} />
          <Stack.Screen name="auth/sign-up" options={{ title: "Create Account" }} />
          <Stack.Screen name="stories/[slug]" options={{ title: "Lesson" }} />
          <Stack.Screen name="series/[slug]" options={{ title: "Series" }} />
        </Stack>
      </MobileAppProvider>
    </SafeAreaProvider>
  );
}
