import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,245,230,1),_rgba(246,239,229,1)_60%,_rgba(236,226,210,1))] px-6">
      <div className="max-w-md space-y-4 rounded-[2rem] border border-black/10 bg-white/85 p-8 text-center shadow-[0_30px_90px_-55px_rgba(84,49,22,0.55)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.25em] text-[#8e5630] uppercase">
          Story Missing
        </p>
        <h1 className="font-heading text-4xl text-[#3d2414]">Page not found</h1>
        <p className="text-sm leading-6 text-[#6b4d3b]">
          That reading page does not exist or you do not have permission to view
          it.
        </p>
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-full bg-[#3f2313] px-5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#5b3420]"
        >
          Return to the library
        </Link>
      </div>
    </main>
  );
}
