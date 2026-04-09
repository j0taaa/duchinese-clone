import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { SeriesCard } from "@/components/SeriesCard";
import { StoryCard } from "@/components/StoryCard";
import { getStandaloneStories } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function AuthorScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { getAuthorProfile, readStoryIds, storyViewCounts } = useMobileApp();
  const profile = getAuthorProfile(userId ?? "");

  if (!profile) {
    return (
      <View style={styles.screen}>
        <EmptyState title="Reader not found" message="That author does not have any public mobile lessons." />
      </View>
    );
  }

  const standalone = getStandaloneStories(profile.stories, profile.series);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: profile.user.name }} />

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.user.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile.user.name}</Text>
        <Text style={styles.subtitle}>
          Public lessons on HanziLane. Private lessons stay on the author's account only.
        </Text>
      </View>

      {profile.series.length ? (
        <View style={styles.section}>
          <SectionHeading
            title="Public series"
            subtitle="Multi-episode collections. Open a card to read in order."
          />
          <View style={styles.stack}>
            {profile.series.map((series) => (
              <SeriesCard
                key={series.slug}
                series={series}
                readCount={series.stories.filter((story) => readStoryIds.includes(story.id)).length}
                totalViews={series.stories.reduce(
                  (sum, story) => sum + (storyViewCounts.get(story.id) ?? 0),
                  0,
                )}
                onPress={() =>
                  router.push({
                    pathname: "/series/[slug]",
                    params: { slug: series.slug },
                  })
                }
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeading
          title={profile.series.length ? "Single lessons" : "Public lessons"}
          subtitle={
            profile.series.length
              ? "Stand-alone readings not part of a series above."
              : "Individual lessons you can open directly."
          }
        />
        {standalone.length ? (
          <View style={styles.stack}>
            {standalone.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isRead={readStoryIds.includes(story.id)}
                viewCount={storyViewCounts.get(story.id)}
                showAuthor={false}
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
            title="No public lessons yet"
            message="This reader has not published any mobile lessons yet."
          />
        )}
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
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "700",
  },
  name: {
    color: colors.text,
    fontSize: 28,
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
