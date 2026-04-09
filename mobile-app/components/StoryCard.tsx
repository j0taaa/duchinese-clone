import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDate, getHskLabel } from "@/lib/content";
import { colors, radius, shadow } from "@/lib/theme";
import type { AppStory } from "@/types/content";

export function StoryCard({
  story,
  isRead = false,
  onPress,
}: {
  story: AppStory;
  isRead?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.art}>
        <Text style={styles.artText}>{story.title.slice(0, 4)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>{getHskLabel(story.hskLevel)}</Text>
        {isRead ? <Text style={[styles.metaChip, styles.readChip]}>Read</Text> : null}
        <Text style={styles.metaText}>{formatDate(story.createdAt)}</Text>
      </View>

      <Text style={styles.title}>{story.title}</Text>
      <Text style={styles.translation}>{story.titleTranslation}</Text>
      <Text numberOfLines={3} style={styles.summary}>
        {story.summary}
      </Text>
      {story.authorName ? <Text style={styles.author}>by {story.authorName}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  art: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: "#f3d0c7",
  },
  artText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  metaChip: {
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  readChip: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 11,
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
  author: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
