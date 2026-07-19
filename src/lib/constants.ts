/** Physics-plane dimensions (undistorted table space, GDD §10). */
export const TABLE_W = 720;
export const TABLE_D = 1000;

/** Depth of the staging strip (near edge) where products launch from. */
export const LAUNCH_ZONE_D = 130;
export const LAUNCH_Y = TABLE_D - LAUNCH_ZONE_D / 2;

/** Perspective presentation (GDD §10 Projection). */
export const FAR_WIDTH_RATIO = 0.84;
export const FAR_SPRITE_SCALE = 0.82;

/** Physics tuning (GDD §10). */
export const DENSITY_BASE = 0.0012;
export const DENSITY_GROWTH = 1.35;
export const RESTITUTION = (tier: number) => 0.42 - 0.02 * tier;
export const FRICTION_AIR = (tier: number) => 0.015 + ((tier - 1) / 10) * 0.02;
export const SURFACE_FRICTION = 0.08;
export const WALL_RESTITUTION = 0.55;

/** Magnetic assist between same-tier pairs. */
export const MAGNET_RANGE = 1.15;
export const MAGNET_FORCE = 0.002;

/** Merge triggers. */
export const MERGE_MIN_SPEED = 0.35;
export const MERGE_REST_MS = 600;

/** Launch velocity range, scaled by 1/sqrt(mass). */
export const LAUNCH_V_MIN = 6;
export const LAUNCH_V_MAX = 22;

/** Combo. */
export const COMBO_WINDOW_MS = 1500;
export const COMBO_MULT = (chain: number) => Math.min(3, 1 + 0.5 * (chain - 1));

/** Failure. */
export const OCCUPANCY_WARN = 0.7;
export const OCCUPANCY_FAIL = 0.85;
export const FAIL_SUSTAIN_MS = 3000;

/** Spawn distribution over tiers 1–5. */
export const SPAWN_WEIGHTS = [30, 27, 20, 14, 9];

/** Mode parameters. */
export const SPEED_MERGE_START_S = 12;
export const SPEED_MERGE_MIN_S = 6;
export const SPEED_MERGE_DECAY_S = 0.1;
export const SHRINK_RATE = 4; // plane units per second
export const SHRINK_EXPAND_RATIO = 0.25;
export const SHRINK_MAX_INSET = 0.3; // of table width
export const ZEN_DECLUTTER_OCCUPANCY = 0.9;

/** Rams moment. */
export const RAMS_COOLDOWN_MS = 60000;

export const SCORE_FOR_MERGE = (tier: number) => tier * tier * 10;
export const MONOLITH_CLEAR_BONUS = 5000;
