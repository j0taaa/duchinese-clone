import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { EmptyState } from "@/components/EmptyState";
import { useMobileApp } from "@/lib/mobile-app-context";
import { colors } from "@/lib/theme";

export default function ProfileScreen() {
  const { isSignedIn, session, signOut, usage } = useMobileApp();

  const totals = usage.reduce(
    (accumulator, entry) => {
      accumulator.generations += 1;
      accumulator.totalTokens += entry.totalTokens;
      accumulator.promptTokens += entry.promptTokens;
      accumulator.completionTokens += entry.completionTokens;
      accumulator.costCredits += Number(entry.costCredits);
      return accumulator;
    },
    {
      generations: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      costCredits: 0,
    },
  );

  if (!isSignedIn || !session) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <EmptyState
          title="Sign in to access your profile"
          message="The mobile app mirrors the website's account-gated generation and usage tracking."
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
      <View style={styles.profileCard}>
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.name}>{session.name}</Text>
        <Text style={styles.email}>{session.email}</Text>
        <Pressable onPress={signOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Generations" value={String(totals.generations)} />
        <StatCard label="Total tokens" value={totals.totalTokens.toLocaleString()} />
        <StatCard
          label="Prompt / completion"
          value={`${totals.promptTokens.toLocaleString()} / ${totals.completionTokens.toLocaleString()}`}
        />
        <StatCard label="Credits" value={totals.costCredits.toFixed(4)} />
      </View>

      <View style={styles.usageCard}>
        <Text style={styles.sectionTitle}>Active model</Text>
        <Text style={styles.usageTitle}>Local mobile scaffold generator</Text>
        <Text style={styles.usageMeta}>
          The website shows the configured model and usage source. This mobile version keeps the same profile surface, but generation is still local-first until a real backend is connected.
        </Text>
      </View>

      <View style={styles.usageSection}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {usage.length ? (
          <View style={styles.stack}>
            {usage.map((entry) => (
              <View key={entry.id} style={styles.usageCard}>
                <Text style={styles.usageTitle}>{entry.title}</Text>
                <Text style={styles.usageMeta}>
                  {new Date(entry.createdAt).toLocaleString()} · {entry.totalTokens.toLocaleString()} tokens
                </Text>
                <Text style={styles.usageMeta}>
                  Prompt {entry.promptTokens.toLocaleString()} / Completion {entry.completionTokens.toLocaleString()} · Credits {entry.costCredits}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No generation activity yet"
            message="Generate a lesson to start filling in usage stats on mobile."
          />
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
  profileCard: {
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  email: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: 8,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 6,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  usageSection: {
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
  usageCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 6,
  },
  usageTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  usageMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
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
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
