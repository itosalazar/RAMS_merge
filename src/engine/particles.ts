/** Merge particles — 6–10 dots tossed with physics, dying in ~300ms (GDD §9). */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  born: number;
  life: number;
}

export interface GlowPulse {
  x: number;
  y: number;
  r: number;
  born: number;
}

export class ParticleField {
  particles: Particle[] = [];
  glows: GlowPulse[] = [];

  burst(x: number, y: number, baseR: number, now: number, rand: () => number): void {
    const n = 6 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const sp = 1.2 + rand() * 2.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 2 + rand() * 1.5,
        color: rand() < 0.5 ? "#ed8008" : "#d9d2c6",
        born: now,
        life: 260 + rand() * 120,
      });
    }
    this.glows.push({ x, y, r: baseR, born: now });
  }

  step(dtMs: number, now: number): void {
    const dt = dtMs / 16.667;
    this.particles = this.particles.filter((p) => now - p.born < p.life);
    for (const p of this.particles) {
      p.x += p.vx * dt * 3;
      p.y += p.vy * dt * 3;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
    this.glows = this.glows.filter((g) => now - g.born < 400);
  }
}
