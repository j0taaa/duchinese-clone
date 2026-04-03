import Script from "next/script";

import { TapTestLab } from "@/components/tap-test-lab";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Script
        id="test-native-listeners"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var ready = document.getElementById('native-script-ready');
              if (ready) ready.textContent = 'yes';

              var nativeButton = document.getElementById('native-listener-button');
              var nativeCount = document.getElementById('native-listener-count');
              if (nativeButton && nativeCount) {
                nativeButton.addEventListener('click', function () {
                  nativeCount.textContent = String(Number(nativeCount.textContent || '0') + 1);
                });
              }
            })();
          `,
        }}
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-4">
        <section className="space-y-3 border border-black p-4">
          <h1 className="text-2xl font-semibold">Mobile Input Diagnostics</h1>
          <p className="text-sm">
            Test these on your phone and tell me exactly which ones work.
          </p>
        </section>

        <section className="space-y-4 border border-black p-4">
          <h2 className="text-xl font-semibold">Browser Native</h2>
          <p className="text-sm">
            These do not depend on React hydration.
          </p>

          <a href="#anchor-target" className="inline-block border border-black px-4 py-3 text-base">
            Native anchor jump
          </a>

          <button
            type="button"
            className="border border-black px-4 py-3 text-base"
            dangerouslySetInnerHTML={{
              __html:
                'Inline onclick count: <span id="inline-onclick-count">0</span>',
            }}
            onClick={undefined}
          />

          <div
            dangerouslySetInnerHTML={{
              __html: `
                <button
                  type="button"
                  onclick="
                    var count = document.getElementById('inline-onclick-count');
                    if (count) count.textContent = String(Number(count.textContent || '0') + 1);
                    var status = document.getElementById('inline-onclick-status');
                    if (status) status.textContent = 'inline onclick fired';
                  "
                  class="border border-black px-4 py-3 text-base"
                >
                  Native inline onclick button
                </button>
              `,
            }}
          />

          <p id="inline-onclick-status" className="text-sm">
            inline onclick status: not fired
          </p>

          <button
            id="native-listener-button"
            type="button"
            className="border border-black px-4 py-3 text-base"
          >
            Native addEventListener count: <span id="native-listener-count">0</span>
          </button>

          <p className="text-sm">
            native script attached: <span id="native-script-ready">no</span>
          </p>

          <div id="anchor-target" className="border border-black p-3 text-sm">
            Anchor target
          </div>
        </section>

        <TapTestLab />
      </div>
    </main>
  );
}
