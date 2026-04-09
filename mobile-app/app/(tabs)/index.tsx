import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { SectionHeading } from "@/components/SectionHeading";
import { SeriesCard } from "@/components/SeriesCard";
import { StoryCard } from "@/components/StoryCard";
import { filterSeries, filterStories, getStandaloneStories } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";
import { hskLevels, type HskLevel } from "@/types/content";

export default function LibraryScreen() {
  const { publicSeries, publicStories, readStoryIds } = useMobileApp();
  const [query, setQuery] = useState("");
  const [hsk, setHsk] = useState<HskLevel | "all">("all");

  const filteredSeries = useMemo(
    () => filterSeries(publicSeries, query, hsk),
    [hsk, publicSeries, query],
  );
  const filteredStories = useMemo(
    () => filterStories(publicStories, query, hsk),
    [hsk, publicStories, query],
  );

  const standaloneStories = useMemo(
    () => getStandaloneStories(filteredStories, publicSeries),
    [filteredStories, publicSeries],
  );
  const starterStories = standaloneStories.filter((story) => story.isSeeded);
  const communityStories = standaloneStories.filter((story) => !story.isSeeded);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Browse Library</Text>
        <Text style={styles.title}>Read graded Chinese stories on your phone</Text>
        <Text style={styles.subtitle}>
          This mobile scaffold mirrors the web app's library, reader, series, and AI lesson flow.
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search titles, summaries, and excerpts"
          placeholderTextColor="#a4958d"
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          <Pill label="All levels" active={hsk === "all"} onPress={() => setHsk("all")} />
          {hskLevels.map((level) => (
            <Pill
              key={level}
              label={`HSK ${level}`}
              active={hsk === level}
              onPress={() => setHsk(level)}
            />
          ))}
        </ScrollView>
      </View>

      {filteredSeries.length ? (
        <View style={styles.section}>
          <SectionHeading
            title="Series"
            subtitle="Collections of connected lessons around the same subject."
          />
          <View style={styles.stack}>
            {filteredSeries.map((series) => {
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
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeading
          title="Starter Library"
          subtitle="Bundled public lessons ready to read without signing in."
        />
        {starterStories.length ? (
          <View style={styles.stack}>
            {starterStories.map((story) => (
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
          <EmptyState title="No matching starter lessons" message="Try a different query or HSK level." />
        )}
      </View>

      {communityStories.length ? (
        <View style={styles.section}>
          <SectionHeading
            title="Public Community Stories"
            subtitle="Shared lessons created by users."
          />
          <View style={styles.stack}>
            {communityStories.map((story) => (
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
      ) : null}

      {!filteredSeries.length && !starterStories.length && !communityStories.length ? (
        <EmptyState
          title="Nothing matched"
          message="The mobile library is wired up. There just are not any lessons under this filter yet."
        />
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
    gap: 22,
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
  pills: {
    gap: 8,
    paddingRight: 12,
  },
  section: {
    gap: 12,
  },
  stack: {
    gap: 12,
  },
});
