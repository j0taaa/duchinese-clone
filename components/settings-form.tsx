"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SettingsForm({
  initialBaseUrl,
  initialModel,
  hasApiKey,
  apiKeyHint,
}: {
  initialBaseUrl: string;
  initialModel: string;
  hasApiKey: boolean;
  apiKeyHint: string | null;
}) {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [model, setModel] = useState(initialModel);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl,
          model,
          apiKey,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to save settings.");
        return;
      }

      setSuccess("Settings saved.");
      setApiKey("");
    });
  }

  return (
    <div className="space-y-5">
      <Field
        label="Model URL"
        description="Full OpenAI-compatible chat completions endpoint."
        value={baseUrl}
        onChange={setBaseUrl}
        placeholder="https://provider.example/v1/chat/completions"
      />
      <Field
        label="Model"
        description="The model identifier the provider expects."
        value={model}
        onChange={setModel}
        placeholder="kimi-k2.5"
      />
      <Field
        label="API key"
        description={
          hasApiKey
            ? `A key is already saved on the server (${apiKeyHint ?? "saved"}). Leave blank to keep it.`
            : "Stored server-side and used only when generating stories."
        }
        value={apiKey}
        onChange={setApiKey}
        placeholder={hasApiKey ? "Leave blank to keep the saved key" : "Paste your provider key"}
        type="password"
      />

      {error ? (
        <div className="rounded-[20px] border border-[#f2c2bc] bg-[#fff2f0] px-4 py-3 text-sm text-[#a03d34]">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[20px] border border-[#d6efe7] bg-[#f4fcf8] px-4 py-3 text-sm text-[#2f7a65]">
          {success}
        </div>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="h-12 rounded-2xl bg-[#ea4e47] px-6 text-white hover:bg-[#dd433d]"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save settings
      </Button>
    </div>
  );
}

function Field({
  label,
  description,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <div>
        <p className="text-sm font-medium text-[#4f433d]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[#6f625c]">{description}</p>
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#e4d8cf] bg-[#fcfaf7] px-4 text-sm text-[#241815] outline-none transition-colors placeholder:text-[#9e928b] focus:border-[#d8b1a6]"
      />
    </label>
  );
}
