import Image from "next/image";
import CameraZone from "@/components/camera/CameraZone";
import CanvasZone from "@/components/canvas/CanvasZone";
import SettingsPanel from "@/components/ui/SettingsPanel";

export default function Home() {
  return (
    <>
      <main className="flex h-screen w-screen overflow-hidden">
        {/* Left: Camera Zone (40% width on desktop, top on mobile) */}
        <section className="w-full md:w-[40%] h-[50%] md:h-full relative z-10 shadow-xl">
          <CameraZone />
        </section>

        {/* Right: Canvas Zone (60% width on desktop, bottom on mobile) */}
        <section className="w-full md:w-[60%] h-[50%] md:h-full relative">
          <CanvasZone />
        </section>
      </main>

      {/* Settings Panel (Floating) */}
      <SettingsPanel />
    </>
  );
}
