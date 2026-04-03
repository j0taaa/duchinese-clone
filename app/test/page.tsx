import { AppHeader } from "@/components/app-header";
import { TapTestLab } from "@/components/tap-test-lab";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f5,_#f7f0e8_52%,_#f3ede4_100%)] text-[#202020]">
      <AppHeader active="library" />
      <TapTestLab />
    </main>
  );
}
