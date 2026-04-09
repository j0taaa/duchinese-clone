import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "@/lib/theme";
import type { StorySection } from "@/types/content";

export function ReaderSectionCard({
  section,
  showPinyin,
  showEnglish,
}: {
  section: StorySection;
  showPinyin: boolean;
  showEnglish: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.hanzi}>{section.hanzi}</Text>
      {showPinyin ? <Text style={styles.pinyin}>{section.pinyin}</Text> : null}
      {showEnglish ? <Text style={styles.english}>{section.english}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  hanzi: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "600",
  },
  pinyin: {
    color: "#a45e4d",
    fontSize: 15,
    lineHeight: 22,
  },
  english: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
