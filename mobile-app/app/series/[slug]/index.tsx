import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { StoryCard } from "@/components/StoryCard";
import { findSeriesBySlug, getHskLabel } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function SeriesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { allSeries, readStoryIds } = useMobileApp();
  const series = findSeriesBySlug(allSeries, slug ?? "");

  if (!series) {
    return (
      <View style={styles.screen}>
        <EmptyState title="Series not found" message="The requested collection does not exist." />
      </View>
    );
  }

  const readCount = series.stories.filter((story) => readStoryIds.includes(story.id)).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: series.titleTranslation }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Series · {getHskLabel(series.hskLevel)}</Text>
        <Text style={styles.title}>{series.title}</Text>
        <Text style={styles.translation}>{series.titleTranslation}</Text>
        <Text style={styles.summary}>{series.summary}</Text>
        <Text style={styles.progress}>
          {readCount}/{series.stories.length} read
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Episodes</Text>
        <View style={styles.stack}>
          {series.stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isRead={readStoryIds.includes(story.id)}
              onPress={() =>
                router.push({
                  pathname: "/stories/[slug]",
                  params: { slug: story.slug },
                })
              }
            />
          ))}
        </View>
      </View>
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
  progress: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
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
});
