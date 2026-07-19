/* Minimal typed event emitter — the engine's only channel to React. */

export interface MergeEvent {
  tier: number; // resulting tier
  x: number;
  y: number;
  chain: number;
  score: number;
  firstDiscovery: boolean;
}

export interface EngineEvents {
  score: { score: number; delta: number };
  merge: MergeEvent;
  combo: { chain: number; mult: number };
  discover: { tier: number };
  gameover: { score: number; largestTier: number; merges: number; durationS: number };
  monolith: { score: number };
  occupancy: { ratio: number };
  timer: { remainingS?: number; elapsedS?: number };
  targetHit: { tier: number; count: number };
  newTarget: { tier: number };
  launch: { tier: number };
  impact: { energy: number; tierA: number; tierB: number };
  staged: { tier: number; nextTier: number; queue: number[] };
}

type Handler<T> = (payload: T) => void;

export class Emitter {
  private handlers = new Map<keyof EngineEvents, Set<Handler<never>>>();

  on<K extends keyof EngineEvents>(type: K, fn: Handler<EngineEvents[K]>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    (this.handlers.get(type) as Set<Handler<EngineEvents[K]>>).add(fn);
    return () => (this.handlers.get(type) as Set<Handler<EngineEvents[K]>>)?.delete(fn);
  }

  emit<K extends keyof EngineEvents>(type: K, payload: EngineEvents[K]): void {
    const set = this.handlers.get(type) as Set<Handler<EngineEvents[K]>> | undefined;
    if (set) for (const fn of set) fn(payload);
  }

  clear(): void {
    this.handlers.clear();
  }
}
