import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { SeriesCard } from "@/components/SeriesCard";
import { StoryCard } from "@/components/StoryCard";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function MyLibraryScreen() {
  const { generatedSeries, generatedStories, isSignedIn, readStoryIds } = useMobileApp();
  const standaloneStories = generatedStories.filter((story) => !story.seriesGroupSlug);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {!isSignedIn ? (
        <EmptyState
          title="No personal library yet"
          message="Create an account, then every generated lesson appears here just like on the web app."
        />
      ) : (
        <>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>My Stories</Text>
            <Text style={styles.title}>Your saved mobile lessons</Text>
            <Text style={styles.subtitle}>
              Private by default, public if you chose to publish them during generation.
            </Text>
          </View>

          <View style={styles.section}>
            <SectionHeading
              title="Your latest series"
              subtitle="Multi-part lesson arcs created from the generator."
            />
            {generatedSeries.length ? (
              <View style={styles.stack}>
                {generatedSeries.map((series) => {
                  const readCount = series.stories.filter((story) => readStoryIds.includes(story.id)).length;
                  return (
                    <SeriesCard
                      key={series.slug}
                      series={series}
                      readCount={readCount}
                      onPress={() =>
                        router.push({
                          pathname: "/series/[slug]",
                          params: { slug: series.slug },
                        })
                      }
                    />
                  );
                })}
              </View>
            ) : (
              <EmptyState
                title="No generated series yet"
                message="Create a series from the Generate tab to see it here."
              />
            )}
          </View>

          <View style={styles.section}>
            <SectionHeading
              title="Your latest single lessons"
              subtitle="Stand-alone lessons not grouped into a series."
            />
            {standaloneStories.length ? (
              <View style={styles.stack}>
                {standaloneStories.map((story) => (
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
            ) : (
              <EmptyState
                title="No generated stories yet"
                message="Create a single story from the Generate tab to populate this section."
              />
            )}
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
  section: {
    gap: 12,
  },
  stack: {
    gap: 12,
  },
});
