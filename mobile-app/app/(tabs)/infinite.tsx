import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { ReaderSectionCard } from "@/components/ReaderSectionCard";
import { getHskLabel } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";
import { hskLevels, type HskLevel } from "@/types/content";

export default function InfiniteScreen() {
  const { allStories } = useMobileApp();
  const [hskLevel, setHskLevel] = useState<HskLevel>("2");
  const [index, setIndex] = useState(0);

  const queue = useMemo(
    () => allStories.filter((story) => story.hskLevel === hskLevel),
    [allStories, hskLevel],
  );
  const story = queue.length ? queue[index % queue.length] : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Infinite</Text>
        <Text style={styles.title}>Swipe-free practice stream</Text>
        <Text style={styles.subtitle}>
          The web app uses an endless reader. This mobile version keeps the same idea with quick next-lesson controls.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {hskLevels.map((level) => (
            <Pill
              key={level}
              label={`HSK ${level}`}
              active={hskLevel === level}
              onPress={() => {
                setHskLevel(level);
                setIndex(0);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {!story ? (
        <EmptyState
          title="No lessons for this level"
          message="Add more stories or change the selected HSK band."
        />
      ) : (
        <>
          <View style={styles.storyChrome}>
            <Text style={styles.modeLabel}>Infinite · {getHskLabel(story.hskLevel)}</Text>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyTranslation}>{story.titleTranslation}</Text>
            <Text style={styles.storySummary}>{story.summary}</Text>
          </View>

          <View style={styles.stack}>
            {story.sections.slice(0, 2).map((section, sectionIndex) => (
              <ReaderSectionCard
                key={`${story.id}-${sectionIndex}`}
                section={section}
                showPinyin
                showEnglish
              />
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/stories/[slug]",
                  params: { slug: story.slug },
                })
              }
              style={[styles.primaryButton, styles.flexButton]}
            >
              <Text style={styles.primaryButtonText}>Open full reader</Text>
            </Pressable>
            <Pressable
              onPress={() => setIndex((current) => current + 1)}
              style={[styles.secondaryButton, styles.flexButton]}
            >
              <Text style={styles.secondaryButtonText}>Next lesson</Text>
            </Pressable>
          </View>
        </>
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
    gap: 12,
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
  pills: {
    gap: 8,
    paddingRight: 12,
  },
  storyChrome: {
    gap: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  modeLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  storyTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
  },
  storyTranslation: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  storySummary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  stack: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 18,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
