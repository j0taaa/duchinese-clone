import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { StoryCard } from "@/components/StoryCard";
import { findSeriesBySlug, getHskLabel } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function SeriesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    allSeries,
    appendSeriesEpisode,
    isSignedIn,
    readStoryIds,
    session,
    storyViewCounts,
  } = useMobileApp();
  const [isAppending, setIsAppending] = useState(false);
  const [appendError, setAppendError] = useState<string | null>(null);
  const series = findSeriesBySlug(allSeries, slug ?? "");

  if (!series) {
    return (
      <View style={styles.screen}>
        <EmptyState title="Series not found" message="The requested collection does not exist." />
      </View>
    );
  }

  const currentSeries = series;

  const readCount = currentSeries.stories.filter((story) => readStoryIds.includes(story.id)).length;
  const canAppend =
    isSignedIn &&
    Boolean(session?.id) &&
    Boolean(currentSeries.ownerUserId) &&
    currentSeries.ownerUserId === session?.id &&
    !currentSeries.stories.some((story) => story.isSeeded);

  async function handleAppend() {
    setAppendError(null);
    setIsAppending(true);

    try {
      const story = await appendSeriesEpisode(currentSeries.slug);
      if (!story) {
        setAppendError("Could not generate the episode.");
        return;
      }

      router.push({
        pathname: "/stories/[slug]",
        params: { slug: story.slug },
      });
    } catch (error) {
      setAppendError(error instanceof Error ? error.message : "Could not generate the episode.");
    } finally {
      setIsAppending(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: currentSeries.titleTranslation }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Series · {getHskLabel(currentSeries.hskLevel)}</Text>
        <Text style={styles.title}>{currentSeries.title}</Text>
        <Text style={styles.translation}>{currentSeries.titleTranslation}</Text>
        <Text style={styles.summary}>{currentSeries.summary}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>
            {readCount}/{currentSeries.stories.length} read
          </Text>
          {currentSeries.ownerName ? <Text style={styles.metaChip}>by {currentSeries.ownerName}</Text> : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Episodes</Text>
        <View style={styles.stack}>
          {currentSeries.stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isRead={readStoryIds.includes(story.id)}
              viewCount={storyViewCounts.get(story.id)}
              onPress={() =>
                router.push({
                  pathname: "/stories/[slug]",
                  params: { slug: story.slug },
                })
              }
              onPressAuthor={
                story.authorUserId
                  ? () =>
                      router.push({
                        pathname: "/authors/[userId]",
                        params: { userId: story.authorUserId! },
                      })
                  : null
              }
            />
          ))}
        </View>
      </View>

      {canAppend ? (
        <View style={styles.appendCard}>
          <Text style={styles.appendEyebrow}>Continue the series</Text>
          <Text style={styles.appendText}>
            Generate a new episode that follows the same story, using the earlier episodes as context.
          </Text>
          <Pressable onPress={handleAppend} disabled={isAppending} style={styles.primaryButton}>
            {isAppending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Generate next episode</Text>
            )}
          </Pressable>
          {appendError ? <Text style={styles.appendError}>{appendError}</Text> : null}
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
    gap: 18,
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
  appendCard: {
    gap: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  appendEyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  appendText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: 18,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  appendError: {
    color: "#a03d34",
    fontSize: 13,
  },
});
