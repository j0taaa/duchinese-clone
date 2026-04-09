import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = getTabIcon(route.name);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Library", headerTitle: "HanziLane" }} />
      <Tabs.Screen name="infinite" options={{ title: "Infinite" }} />
      <Tabs.Screen name="vocabulary" options={{ title: "Vocabulary" }} />
      <Tabs.Screen name="generate" options={{ title: "Generate" }} />
      <Tabs.Screen name="my-library" options={{ title: "My Library" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function getTabIcon(name: string): keyof typeof Ionicons.glyphMap {
  switch (name) {
    case "index":
      return "library-outline";
    case "infinite":
      return "infinite-outline";
    case "vocabulary":
      return "text-outline";
    case "generate":
      return "sparkles-outline";
    case "my-library":
      return "book-outline";
    case "profile":
      return "person-outline";
    default:
      return "ellipse-outline";
  }
}
