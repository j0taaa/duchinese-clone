"use client";

import { useMemo, useState } from "react";

type LogEntry = {
  id: string;
  label: string;
  event: string;
  at: string;
};

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function TokenLike({
  hanzi,
  pinyin,
  active,
  onClick,
  onTouchStart,
  onTouchEnd,
  onPointerDown,
  onPointerUp,
}: {
  hanzi: string;
  pinyin: string;
  active?: boolean;
  onClick?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={[
        "inline-flex flex-col items-start border px-2 py-1 text-left",
        active ? "border-black bg-gray-100" : "border-black bg-white",
      ].join(" ")}
    >
      <span className="text-sm text-black">{pinyin}</span>
      <span className="font-reading text-4xl leading-none text-black">
        {hanzi}
      </span>
    </button>
  );
}

function TestBlock({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border border-black p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <span className="border border-black px-3 py-1 text-sm text-black">
            {count} fires
          </span>
        </div>
        <p className="text-sm leading-6 text-black">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function TapTestLab() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const record = (id: string, label: string, event: string) => {
    setCounts((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    }));
    setSelected(id);
    setLog((current) => [
      {
        id,
        label,
        event,
        at: nowLabel(),
      },
      ...current,
    ].slice(0, 14));
  };

  const countFor = (id: string) => counts[id] ?? 0;

  const latestSummary = useMemo(() => {
    if (!log.length) {
      return "No events yet.";
    }

    const latest = log[0];
    return `${latest.label} fired via ${latest.event} at ${latest.at}`;
  }, [log]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4">
      <section className="space-y-3 border border-black p-4">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Mobile Tap Test Lab
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-black">
          Test these on your phone and tell me which blocks work. I want to know
          which exact event strategy fires reliably on the real device.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-black px-3 py-1.5 text-sm text-black">
            {latestSummary}
          </span>
          <button
            type="button"
            onClick={() => {
              setCounts({});
              setSelected(null);
              setLog([]);
            }}
            className="border border-black px-4 py-2 text-sm font-medium text-black"
          >
            Reset results
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <TestBlock
          title="1. Plain Button"
          description="A normal native button with only onClick."
          count={countFor("plain-button")}
        >
          <button
            type="button"
            onClick={() => record("plain-button", "Plain Button", "click")}
            className="border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test plain button
          </button>
        </TestBlock>

        <TestBlock
          title="2. Button With Touch Start"
          description="Native button using onTouchStart and onClick."
          count={countFor("touch-start-button")}
        >
          <button
            type="button"
            onClick={() =>
              record("touch-start-button", "Button With Touch Start", "click")
            }
            onTouchStart={() =>
              record(
                "touch-start-button",
                "Button With Touch Start",
                "touchstart",
              )
            }
            className="border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test touchstart button
          </button>
        </TestBlock>

        <TestBlock
          title="3. Button With Touch End"
          description="Native button using onTouchEnd and onClick."
          count={countFor("touch-end-button")}
        >
          <button
            type="button"
            onClick={() =>
              record("touch-end-button", "Button With Touch End", "click")
            }
            onTouchEnd={() =>
              record("touch-end-button", "Button With Touch End", "touchend")
            }
            className="border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test touchend button
          </button>
        </TestBlock>

        <TestBlock
          title="4. Button With Pointer Down"
          description="Native button using onPointerDown and onClick."
          count={countFor("pointer-down-button")}
        >
          <button
            type="button"
            onClick={() =>
              record("pointer-down-button", "Button With Pointer Down", "click")
            }
            onPointerDown={() =>
              record(
                "pointer-down-button",
                "Button With Pointer Down",
                "pointerdown",
              )
            }
            className="border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test pointerdown button
          </button>
        </TestBlock>

        <TestBlock
          title="5. Button With Pointer Up"
          description="Native button using onPointerUp and onClick."
          count={countFor("pointer-up-button")}
        >
          <button
            type="button"
            onClick={() =>
              record("pointer-up-button", "Button With Pointer Up", "click")
            }
            onPointerUp={() =>
              record("pointer-up-button", "Button With Pointer Up", "pointerup")
            }
            className="border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test pointerup button
          </button>
        </TestBlock>

        <TestBlock
          title="6. Div Role Button"
          description="A non-button element with role=button and onClick."
          count={countFor("div-button")}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => record("div-button", "Div Role Button", "click")}
            className="inline-flex border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test div role button
          </div>
        </TestBlock>

        <TestBlock
          title="7. Token Style Click"
          description="Reader-like word chip using only onClick."
          count={countFor("token-click")}
        >
          <TokenLike
            hanzi="我"
            pinyin="wo"
            active={selected === "token-click"}
            onClick={() => record("token-click", "Token Style Click", "click")}
          />
        </TestBlock>

        <TestBlock
          title="8. Token Style Touch Start"
          description="Reader-like word chip using onTouchStart and onClick."
          count={countFor("token-touchstart")}
        >
          <TokenLike
            hanzi="你"
            pinyin="ni"
            active={selected === "token-touchstart"}
            onClick={() =>
              record("token-touchstart", "Token Style Touch Start", "click")
            }
            onTouchStart={() =>
              record(
                "token-touchstart",
                "Token Style Touch Start",
                "touchstart",
              )
            }
          />
        </TestBlock>

        <TestBlock
          title="9. Token Style Touch End"
          description="Reader-like word chip using onTouchEnd and onClick."
          count={countFor("token-touchend")}
        >
          <TokenLike
            hanzi="他"
            pinyin="ta"
            active={selected === "token-touchend"}
            onClick={() =>
              record("token-touchend", "Token Style Touch End", "click")
            }
            onTouchEnd={() =>
              record("token-touchend", "Token Style Touch End", "touchend")
            }
          />
        </TestBlock>

        <TestBlock
          title="10. Token Style Pointer Down"
          description="Reader-like word chip using onPointerDown and onClick."
          count={countFor("token-pointerdown")}
        >
          <TokenLike
            hanzi="们"
            pinyin="men"
            active={selected === "token-pointerdown"}
            onClick={() =>
              record("token-pointerdown", "Token Style Pointer Down", "click")
            }
            onPointerDown={() =>
              record(
                "token-pointerdown",
                "Token Style Pointer Down",
                "pointerdown",
              )
            }
          />
        </TestBlock>

        <TestBlock
          title="11. Token Style Pointer Up"
          description="Reader-like word chip using onPointerUp and onClick."
          count={countFor("token-pointerup")}
        >
          <TokenLike
            hanzi="好"
            pinyin="hao"
            active={selected === "token-pointerup"}
            onClick={() =>
              record("token-pointerup", "Token Style Pointer Up", "click")
            }
            onPointerUp={() =>
              record(
                "token-pointerup",
                "Token Style Pointer Up",
                "pointerup",
              )
            }
          />
        </TestBlock>

        <TestBlock
          title="12. Anchor Tap"
          description="An anchor element that prevents navigation and just logs."
          count={countFor("anchor-tap")}
        >
          <a
            href="#anchor-test"
            onClick={(event) => {
              event.preventDefault();
              record("anchor-tap", "Anchor Tap", "click");
            }}
            className="inline-flex border border-black px-5 py-3 text-base font-medium text-black"
          >
            Test anchor tap
          </a>
        </TestBlock>
      </div>

      <section className="border border-black p-4">
        <h2 className="text-lg font-semibold text-black">Event Log</h2>
        <div className="mt-4 space-y-2">
          {log.length ? (
            log.map((entry, index) => (
              <div
                key={`${entry.id}-${index}-${entry.at}`}
                className="border border-black px-4 py-3 text-sm text-black"
              >
                <span className="font-medium">{entry.label}</span>
                <span> fired via </span>
                <span className="font-medium">{entry.event}</span>
                <span> at {entry.at}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-black">
              No events recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
