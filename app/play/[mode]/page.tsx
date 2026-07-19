import { GameScreen } from "@/src/components/game/GameScreen";
import { MODES, type GameMode } from "@/src/engine/modes";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.id }));
}

export default async function PlayPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (!MODES.some((m) => m.id === mode)) notFound();
  return <GameScreen mode={mode as GameMode} />;
}
