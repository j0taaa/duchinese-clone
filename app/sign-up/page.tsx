import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f5,_#f7f0e8_52%,_#f3ede4_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1220px] gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="space-y-6 rounded-[36px] border border-white/70 bg-white/82 p-8 shadow-[0_26px_90px_-58px_rgba(92,46,24,0.42)] backdrop-blur sm:p-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6ce] bg-[#fff3ef] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#d14f43] uppercase">
              HanziLane
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#241815] sm:text-5xl">
              Create an account and start building your own Chinese story library
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#6a5b55] sm:text-base">
              Your account keeps generated stories, private drafts, and model
              settings attached to you instead of the browser you happen to be on.
            </p>
          </div>
        </section>

        <AuthForm mode="sign-up" />
      </div>
    </main>
  );
}
