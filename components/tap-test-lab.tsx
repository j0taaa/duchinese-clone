"use client";

import { useState } from "react";

export function TapTestLab() {
  const [reactClickCount, setReactClickCount] = useState(0);
  const [reactTouchStartCount, setReactTouchStartCount] = useState(0);
  const [reactPointerDownCount, setReactPointerDownCount] = useState(0);
  const reactReady = typeof window !== "undefined";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

  return (
    <section className="space-y-4 border border-black p-4">
      <h2 className="text-xl font-semibold">React Diagnostics</h2>
      <p className="text-sm">
        React hydrated: <strong>{reactReady ? "yes" : "no"}</strong>
      </p>
      <p className="break-words text-sm">
        User agent: <strong>{ua}</strong>
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setReactClickCount((value) => value + 1)}
          className="border border-black px-4 py-3 text-base"
        >
          React onClick count: {reactClickCount}
        </button>

        <button
          type="button"
          onTouchStart={() => setReactTouchStartCount((value) => value + 1)}
          onClick={() => setReactClickCount((value) => value + 1)}
          className="border border-black px-4 py-3 text-base"
        >
          React onTouchStart count: {reactTouchStartCount}
        </button>

        <button
          type="button"
          onPointerDown={() => setReactPointerDownCount((value) => value + 1)}
          onClick={() => setReactClickCount((value) => value + 1)}
          className="border border-black px-4 py-3 text-base"
        >
          React onPointerDown count: {reactPointerDownCount}
        </button>
      </div>
    </section>
  );
}
