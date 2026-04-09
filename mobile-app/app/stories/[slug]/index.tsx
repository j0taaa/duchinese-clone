import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { Pill } from "@/components/Pill";
import { ReaderSectionCard } from "@/components/ReaderSectionCard";
import { findStoryBySlug, getHskLabel, getSeriesForStory } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function StoryReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { allSeries, allStories, markRead } = useMobileApp();
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);

  const story = useMemo(() => findStoryBySlug(allStories, slug ?? ""), [allStories, slug]);
  const series = useMemo(
    () => (story ? getSeriesForStory(allSeries, story.slug) : null),
    [allSeries, story],
  );
  const currentIndex = story && series ? series.stories.findIndex((entry) => entry.slug === story.slug) : -1;
  const previousStory = currentIndex > 0 && series ? series.stories[currentIndex - 1] : null;
  const nextStory =
    currentIndex >= 0 && series && currentIndex < series.stories.length - 1
      ? series.stories[currentIndex + 1]
      : null;

  useEffect(() => {
    if (story) {
      markRead(story.id);
    }
  }, [markRead, story]);

  if (!story) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Story not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: story.titleTranslation }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{getHskLabel(story.hskLevel)}</Text>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.translation}>{story.titleTranslation}</Text>
        <Text style={styles.summary}>{story.summary}</Text>
        {series ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/series/[slug]",
                params: { slug: series.slug },
              })
            }
            style={styles.seriesButton}
          >
            <Text style={styles.seriesButtonText}>Open series</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.toggles}>
        <Pill label="Pinyin" active={showPinyin} onPress={() => setShowPinyin((value) => !value)} />
        <Pill label="English" active={showEnglish} onPress={() => setShowEnglish((value) => !value)} />
      </View>

      <View style={styles.stack}>
        {story.sections.map((section, index) => (
          <ReaderSectionCard
            key={`${story.id}-${index}`}
            section={section}
            showPinyin={showPinyin}
            showEnglish={showEnglish}
          />
        ))}
      </View>

      {series ? (
        <View style={styles.navRow}>
          <Pressable
            disabled={!previousStory}
            onPress={() =>
              previousStory
                ? router.replace({
                    pathname: "/stories/[slug]",
                    params: { slug: previousStory.slug },
                  })
                : undefined
            }
            style={[styles.navButton, !previousStory && styles.navButtonDisabled]}
          >
            <Text style={[styles.navButtonText, !previousStory && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </Pressable>
          <Pressable
            disabled={!nextStory}
            onPress={() =>
              nextStory
                ? router.replace({
                    pathname: "/stories/[slug]",
                    params: { slug: nextStory.slug },
                  })
                : undefined
            }
            style={[styles.navButton, !nextStory && styles.navButtonDisabled]}
          >
            <Text style={[styles.navButtonText, !nextStory && styles.navButtonTextDisabled]}>Next</Text>
          </Pressable>
        </View>
      ) : null}
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
    gap: 16,
  },
  hero: {
    gap: 8,
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
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
  },
  translation: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  seriesButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  seriesButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  toggles: {
    flexDirection: "row",
    gap: 8,
  },
  stack: {
    gap: 12,
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  notFoundTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
});
