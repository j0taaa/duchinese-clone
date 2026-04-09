import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { Pill } from "@/components/Pill";
import { ReaderSectionCard } from "@/components/ReaderSectionCard";
import { StoryCard } from "@/components/StoryCard";
import {
  findStoryBySlug,
  getHskLabel,
  getSeriesForStory,
} from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";
import { lookupCharacter } from "@/lib/vocabulary";

export default function StoryReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    allSeries,
    allStories,
    markRead,
    readStoryIds,
    recordView,
    storyViewCounts,
  } = useMobileApp();
  const [showCharacters, setShowCharacters] = useState(true);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);

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
  const activeDefinition = activeCharacter ? lookupCharacter(activeCharacter) : null;
  const recommendedStories = useMemo(() => {
    if (!story) {
      return [];
    }

    return allStories
      .filter((entry) => entry.slug !== story.slug && entry.hskLevel === story.hskLevel)
      .slice(0, 3);
  }, [allStories, story]);

  useEffect(() => {
    if (story) {
      markRead(story.id);
      recordView(story.id);
    }
  }, [markRead, recordView, story]);

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
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>{storyViewCounts.get(story.id) ?? 0} views</Text>
          {story.authorName && story.authorUserId ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/authors/[userId]",
                  params: { userId: story.authorUserId! },
                })
              }
            >
              <Text style={[styles.metaChip, styles.authorChip]}>by {story.authorName}</Text>
            </Pressable>
          ) : null}
          {series ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/series/[slug]",
                  params: { slug: series.slug },
                })
              }
            >
              <Text style={styles.metaChip}>Series</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.toggles}>
        <Pill label="Characters" active={showCharacters} onPress={() => setShowCharacters((value) => !value)} />
        <Pill label="Pinyin" active={showPinyin} onPress={() => setShowPinyin((value) => !value)} />
        <Pill label="English" active={showEnglish} onPress={() => setShowEnglish((value) => !value)} />
      </View>

      {activeCharacter ? (
        <View style={styles.definitionCard}>
          <Text style={styles.definitionLabel}>Word meaning</Text>
          <Text style={styles.definitionHanzi}>{activeCharacter}</Text>
          <Text style={styles.definitionPinyin}>{activeDefinition?.pinyin ?? "No pinyin"}</Text>
          <Text style={styles.definitionText}>
            {activeDefinition?.definition ?? "No dictionary definition available."}
          </Text>
        </View>
      ) : null}

      <View style={styles.stack}>
        {story.sections.map((section, index) => (
          <ReaderSectionCard
            key={`${story.id}-${index}`}
            section={section}
            showCharacters={showCharacters}
            showPinyin={showPinyin}
            showEnglish={showEnglish}
            activeCharacter={activeCharacter}
            onPressCharacter={setActiveCharacter}
          />
        ))}
      </View>

      {series ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Series episodes</Text>
          <View style={styles.stack}>
            {series.stories.map((entry, index) => (
              <Pressable
                key={entry.id}
                onPress={() =>
                  router.replace({
                    pathname: "/stories/[slug]",
                    params: { slug: entry.slug },
                  })
                }
                style={[
                  styles.episodeCard,
                  entry.slug === story.slug && styles.activeEpisodeCard,
                ]}
              >
                <Text style={styles.episodeLabel}>Episode {index + 1}</Text>
                <Text style={styles.episodeTitle}>{entry.titleTranslation}</Text>
                <Text style={styles.episodeMeta}>{entry.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {recommendedStories.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended lessons</Text>
          <View style={styles.stack}>
            {recommendedStories.map((entry) => (
              <StoryCard
                key={entry.id}
                story={entry}
                isRead={readStoryIds.includes(entry.id)}
                viewCount={storyViewCounts.get(entry.id)}
                onPress={() =>
                  router.push({
                    pathname: "/stories/[slug]",
                    params: { slug: entry.slug },
                  })
                }
                onPressAuthor={
                  entry.authorUserId
                    ? () =>
                        router.push({
                          pathname: "/authors/[userId]",
                          params: { userId: entry.authorUserId! },
                        })
                    : null
                }
              />
            ))}
          </View>
        </View>
      ) : null}

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
            <Text style={[styles.navButtonText, !nextStory && styles.navButtonTextDisabled]}>
              Next
            </Text>
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  authorChip: {
    color: colors.accent,
  },
  toggles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  definitionCard: {
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  definitionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  definitionHanzi: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "700",
  },
  definitionPinyin: {
    color: "#a45e4d",
    fontSize: 15,
    fontWeight: "600",
  },
  definitionText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  stack: {
    gap: 12,
  },
  episodeCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 4,
  },
  activeEpisodeCard: {
    backgroundColor: colors.accentSoft,
  },
  episodeLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  episodeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  episodeMeta: {
    color: colors.textMuted,
    fontSize: 13,
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
