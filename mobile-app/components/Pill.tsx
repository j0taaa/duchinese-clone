import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius } from "@/lib/theme";

type PillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Pill({ label, active = false, onPress }: PillProps) {
  const content = (
    <View style={[styles.base, active ? styles.active : styles.inactive]}>
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inactive: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  inactiveLabel: {
    color: colors.textMuted,
  },
  activeLabel: {
    color: "#ffffff",
  },
});
