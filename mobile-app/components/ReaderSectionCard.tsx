import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius } from "@/lib/theme";
import type { StorySection } from "@/types/content";

export function ReaderSectionCard({
  section,
  showCharacters,
  showPinyin,
  showEnglish,
  activeCharacter,
  onPressCharacter,
}: {
  section: StorySection;
  showCharacters: boolean;
  showPinyin: boolean;
  showEnglish: boolean;
  activeCharacter?: string | null;
  onPressCharacter?: (character: string) => void;
}) {
  return (
    <View style={styles.card}>
      {showCharacters ? (
        <View style={styles.tokenWrap}>
          {Array.from(section.hanzi).map((character, index) => {
            const isChinese = /[\u3400-\u9fff]/u.test(character);

            if (!isChinese) {
              return (
                <Text key={`${character}-${index}`} style={styles.hanzi}>
                  {character}
                </Text>
              );
            }

            const active = activeCharacter === character;

            return (
              <Pressable
                key={`${character}-${index}`}
                onPress={() => onPressCharacter?.(character)}
                style={[styles.token, active && styles.activeToken]}
              >
                <Text style={[styles.hanzi, active && styles.activeHanzi]}>{character}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.hiddenCharacters}>
          <Text style={styles.hiddenCharactersText}>Characters hidden</Text>
        </View>
      )}
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
  tokenWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  token: {
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  activeToken: {
    backgroundColor: colors.accentSoft,
  },
  hanzi: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "600",
  },
  activeHanzi: {
    color: colors.accent,
  },
  hiddenCharacters: {
    borderRadius: 16,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hiddenCharactersText: {
    color: colors.textMuted,
    fontSize: 13,
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
