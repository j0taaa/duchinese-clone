import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { ReaderSectionCard } from "@/components/ReaderSectionCard";
import { mobileApi } from "@/lib/api";
import { getHskLabel } from "@/lib/content";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";
import { hskLevels, type AppStory, type HskLevel } from "@/types/content";

export default function InfiniteScreen() {
  const { markRead, recordView, refreshBootstrap, sessionToken } = useMobileApp();
  const [hskLevel, setHskLevel] = useState<HskLevel>("2");
  const [story, setStory] = useState<AppStory | null>(null);
  const [mode, setMode] = useState<"vocab" | "random" | "generated" | null>(null);
  const [targetHanzi, setTargetHanzi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNextStory(level: HskLevel) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mobileApi.fetchInfiniteNext(sessionToken, level);
      setStory(response.story);
      setMode(response.mode);
      setTargetHanzi(response.targetHanzi ?? null);

      if (response.mode === "generated") {
        await refreshBootstrap();
      }
    } catch (loadError) {
      setStory(null);
      setMode(null);
      setTargetHanzi(null);
      setError(loadError instanceof Error ? loadError.message : "Could not load the next lesson.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNextStory(hskLevel);
  }, [hskLevel, sessionToken]);

  useEffect(() => {
    if (story) {
      void markRead(story.id);
      void recordView(story.id);
    }
  }, [markRead, recordView, story]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Infinite</Text>
        <Text style={styles.title}>Swipe-free practice stream</Text>
        <Text style={styles.subtitle}>
          This stream asks the website backend for the next lesson instead of rotating through local mock data.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {hskLevels.map((level) => (
            <Pill
              key={level}
              label={`HSK ${level}`}
              active={hskLevel === level}
              onPress={() => setHskLevel(level)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading the next lesson...</Text>
        </View>
      ) : error ? (
        <EmptyState
          title="Could not load the stream"
          message={error}
        />
      ) : !story ? (
        <EmptyState
          title="No lessons for this level"
          message="Add more stories or change the selected HSK band."
        />
      ) : (
        <>
          <View style={styles.storyChrome}>
            <Text style={styles.modeLabel}>
              Infinite · {getHskLabel(story.hskLevel)}
              {mode ? ` · ${mode}` : ""}
            </Text>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyTranslation}>{story.titleTranslation}</Text>
            <Text style={styles.storySummary}>{story.summary}</Text>
            {targetHanzi ? <Text style={styles.targetChip}>Focus character: {targetHanzi}</Text> : null}
          </View>

          <View style={styles.stack}>
            {story.sections.slice(0, 2).map((section, sectionIndex) => (
              <ReaderSectionCard
                key={`${story.id}-${sectionIndex}`}
                section={section}
                showCharacters
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
              onPress={() => void loadNextStory(hskLevel)}
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
  loadingCard: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
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
  targetChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.backgroundMuted,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
