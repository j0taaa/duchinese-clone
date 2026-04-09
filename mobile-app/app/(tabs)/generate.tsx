import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { SectionHeading } from "@/components/SectionHeading";
import { StoryCard } from "@/components/StoryCard";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";
import {
  hskLevels,
  lessonLengths,
  storyTypes,
  visibilities,
  type GenerationInput,
} from "@/types/content";

const modes: GenerationInput["mode"][] = ["story", "series"];

export default function GenerateScreen() {
  const {
    generateLesson,
    generatedStories,
    getReviewCharactersForLevel,
    isSignedIn,
    readStoryIds,
    storyViewCounts,
  } = useMobileApp();
  const [topic, setTopic] = useState("");
  const [hskLevel, setHskLevel] = useState<GenerationInput["hskLevel"]>("2");
  const [type, setType] = useState<GenerationInput["type"]>("dialogue");
  const [length, setLength] = useState<GenerationInput["length"]>("short");
  const [visibility, setVisibility] = useState<GenerationInput["visibility"]>("private");
  const [mode, setMode] = useState<GenerationInput["mode"]>("story");
  const [useVocabularyTargets, setUseVocabularyTargets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewCharacters = getReviewCharactersForLevel(hskLevel);

  async function handleGenerate() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await generateLesson({
        topic,
        hskLevel,
        type,
        length,
        visibility,
        mode,
        useVocabularyTargets,
        reviewCharacters: useVocabularyTargets
          ? reviewCharacters.map((entry) => entry.hanzi)
          : [],
      });

      if (result.kind === "story") {
        router.push({
          pathname: "/stories/[slug]",
          params: { slug: result.story.slug },
        });
      } else {
        router.push({
          pathname: "/series/[slug]",
          params: { slug: result.series.slug },
        });
      }
    } catch (generationError) {
      setError(
        generationError instanceof Error ? generationError.message : "Could not generate a lesson.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSignedIn) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <EmptyState
          title="Sign in to generate lessons"
          message="The web app gates generation behind an account. This mobile replica does the same."
        />
        <View style={styles.buttonRow}>
          <Pressable onPress={() => router.push("/auth/sign-in")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/auth/sign-up")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>AI lesson builder</Text>
        <Text style={styles.title}>Generate something new to read</Text>
        <Text style={styles.subtitle}>
          This mobile version simulates the web app's story and series creation flow while keeping a clean seam for real backend calls later.
        </Text>
      </View>

      <View style={styles.card}>
        <SectionHeading
          title="Create lesson"
          subtitle="Pick the mode, level, lesson type, and a prompt. The result is saved into My Library."
        />

        <Text style={styles.label}>Creation mode</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {modes.map((entry) => (
            <Pill
              key={entry}
              label={entry === "story" ? "Story" : "Series"}
              active={mode === entry}
              onPress={() => setMode(entry)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Topic or direction</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="Two classmates finding a quiet cafe to study"
          placeholderTextColor="#a4958d"
          style={styles.textInput}
        />

        <Text style={styles.label}>Vocabulary targets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          <Pill
            label="Off"
            active={!useVocabularyTargets}
            onPress={() => setUseVocabularyTargets(false)}
          />
          <Pill
            label="Use overdue words"
            active={useVocabularyTargets}
            onPress={() => setUseVocabularyTargets(true)}
          />
        </ScrollView>
        {useVocabularyTargets ? (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Suggested review characters</Text>
            <Text style={styles.reviewSubtitle}>
              Pulled from your mobile reading history, similar to the website's overdue vocabulary suggestions.
            </Text>
            <View style={styles.reviewRow}>
              {reviewCharacters.map((entry) => (
                <Text key={entry.hanzi} style={styles.reviewChip}>
                  {entry.hanzi}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.label}>HSK level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {hskLevels.map((entry) => (
            <Pill
              key={entry}
              label={`HSK ${entry}`}
              active={hskLevel === entry}
              onPress={() => setHskLevel(entry)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Lesson type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {storyTypes.map((entry) => (
            <Pill
              key={entry}
              label={entry === "story" ? "Narrative" : entry === "dialogue" ? "Dialogue" : "Journal"}
              active={type === entry}
              onPress={() => setType(entry)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Length</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {lessonLengths.map((entry) => (
            <Pill
              key={entry}
              label={entry[0]!.toUpperCase() + entry.slice(1)}
              active={length === entry}
              onPress={() => setLength(entry)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Visibility</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {visibilities.map((entry) => (
            <Pill
              key={entry}
              label={entry === "private" ? "Private" : "Public"}
              active={visibility === entry}
              onPress={() => setVisibility(entry)}
            />
          ))}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={handleGenerate} disabled={isSubmitting} style={styles.primaryButton}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === "story" ? "Generate lesson" : "Generate series"}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionHeading
          title="Recent mobile generations"
          subtitle="These live in local app state today and mirror the web app's private library concept."
        />
        {generatedStories.length ? (
          <View style={styles.stack}>
            {generatedStories.slice(0, 4).map((story) => (
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
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No generated lessons yet"
            message="Create your first story or series to populate the mobile library."
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
  card: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  section: {
    gap: 12,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  textInput: {
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
  stack: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
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
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  error: {
    color: "#a03d34",
    fontSize: 13,
    lineHeight: 20,
  },
  reviewCard: {
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    padding: 14,
  },
  reviewTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  reviewSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  reviewChip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
