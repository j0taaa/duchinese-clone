import { Pressable, StyleSheet, Text, View } from "react-native";

import { getHskLabel } from "@/lib/content";
import { colors, radius, shadow } from "@/lib/theme";
import type { AppSeries } from "@/types/content";

export function SeriesCard({
  series,
  readCount,
  onPress,
}: {
  series: AppSeries;
  readCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Series</Text>
        <Text style={styles.heroText}>{series.title.slice(0, 4)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.chip}>{getHskLabel(series.hskLevel)}</Text>
          <Text style={styles.chip}>{series.stories.length} episodes</Text>
          <Text style={[styles.chip, readCount > 0 && styles.progressChip]}>
            {readCount}/{series.stories.length} read
          </Text>
        </View>
        <Text style={styles.title}>{series.title}</Text>
        <Text style={styles.translation}>{series.titleTranslation}</Text>
        <Text style={styles.summary}>{series.summary}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    ...shadow.card,
  },
  pressed: {
    opacity: 0.94,
  },
  hero: {
    padding: 16,
    backgroundColor: "#d98175",
    gap: 12,
  },
  heroLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  body: {
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  progressChip: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  translation: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
