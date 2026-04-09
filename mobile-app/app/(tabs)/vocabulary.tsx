import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

const validLevels = ["all", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"] as const;

export default function VocabularyScreen() {
  const { vocabularyLevels } = useMobileApp();
  const [selectedLevel, setSelectedLevel] = useState<(typeof validLevels)[number]>("all");
  const [query, setQuery] = useState("");

  const visibleLevels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scopedLevels =
      selectedLevel === "all"
        ? vocabularyLevels
        : vocabularyLevels.filter((level) => level.key === selectedLevel);

    return scopedLevels
      .map((level) => ({
        ...level,
        characters: normalizedQuery
          ? level.characters.filter((entry) =>
              [entry.hanzi, entry.pinyin ?? "", entry.definition ?? ""]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery),
            )
          : level.characters,
      }))
      .filter((level) => level.characters.length > 0);
  }, [query, selectedLevel, vocabularyLevels]);

  const filters = [
    { key: "all", title: "All" },
    ...vocabularyLevels.map((level) => ({ key: level.key, title: level.title })),
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Vocabulary</Text>
        <Text style={styles.title}>Track what you have actually read</Text>
        <Text style={styles.subtitle}>
          Search Hanzi, pinyin, or English, then filter by HSK level like the website vocabulary page.
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Hanzi, pinyin, or translation"
          placeholderTextColor="#a4958d"
          style={styles.search}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((level) => (
          <Pill
            key={level.key}
            label={level.title}
            active={selectedLevel === level.key}
            onPress={() => setSelectedLevel(level.key as (typeof validLevels)[number])}
          />
        ))}
      </ScrollView>

      {visibleLevels.length ? (
        <View style={styles.stack}>
          {visibleLevels.map((level) => (
            <View key={level.key} style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelCount}>{level.characters.length} characters</Text>
              </View>

              <View style={styles.characterGrid}>
                {level.characters.map((entry) => (
                  <View key={`${level.key}-${entry.hanzi}`} style={styles.characterCard}>
                    <Text style={styles.hanzi}>{entry.hanzi}</Text>
                    <Text style={styles.pinyin}>{entry.pinyin ?? "No pinyin"}</Text>
                    <Text style={styles.definition}>
                      {entry.definition ?? "No definition available."}
                    </Text>
                    <View style={styles.metaWrap}>
                      <Text style={styles.metaChip}>{entry.readCount} reads</Text>
                      <Text style={styles.metaChip}>
                        {entry.lastReadAt
                          ? `Last read ${new Date(entry.lastReadAt).toLocaleDateString("en-US")}`
                          : "Not read yet"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState title="No vocabulary matched" message="Try a different search or HSK filter." />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  hero: {
    gap: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  search: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  filters: {
    gap: 8,
    paddingRight: 12,
  },
  stack: {
    gap: 16,
  },
  levelCard: {
    gap: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  levelTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  levelCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  characterGrid: {
    gap: 10,
  },
  characterCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    padding: 14,
    gap: 6,
  },
  hanzi: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  pinyin: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  definition: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  metaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
