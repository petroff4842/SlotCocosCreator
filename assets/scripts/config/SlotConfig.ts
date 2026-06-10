export const SlotConfig = {
  REEL_COUNT: 5,
  VISIBLE_ROWS: 3,

  SYMBOL_WIDTH: 140,
  SYMBOL_HEIGHT: 140,

  REEL_AREA_WIDTH: 700,
  REEL_AREA_HEIGHT: 420,
};

export enum SymbolId {
  Wild = 0,
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  L1 = 5,
  L2 = 6,
  L3 = 7,
  L4 = 8,
  L5 = 9,
}

export const ALL_SYMBOLS: SymbolId[] = [
  SymbolId.Wild,
  SymbolId.H1,
  SymbolId.H2,
  SymbolId.H3,
  SymbolId.H4,
  SymbolId.L1,
  SymbolId.L2,
  SymbolId.L3,
  SymbolId.L4,
  SymbolId.L5,
];

export const SYMBOL_ASSET_PATHS: Record<SymbolId, string> = {
  [SymbolId.Wild]: "symbols/1/spriteFrame",
  [SymbolId.H1]: "symbols/2/spriteFrame",
  [SymbolId.H2]: "symbols/3/spriteFrame",
  [SymbolId.H3]: "symbols/4/spriteFrame",
  [SymbolId.H4]: "symbols/5/spriteFrame",

  [SymbolId.L1]: "symbols/6/spriteFrame",
  [SymbolId.L2]: "symbols/7/spriteFrame",
  [SymbolId.L3]: "symbols/8/spriteFrame",
  [SymbolId.L4]: "symbols/9/spriteFrame",
  [SymbolId.L5]: "symbols/10/spriteFrame",
};

export const REEL_STRIP: SymbolId[] = [
  SymbolId.L5,
  SymbolId.L4,
  SymbolId.L3,
  SymbolId.L2,
  SymbolId.L1,
  SymbolId.H4,
  SymbolId.L5,
  SymbolId.Wild,
  SymbolId.L3,
  SymbolId.H3,
  SymbolId.L2,
  SymbolId.L4,
  SymbolId.H2,
  SymbolId.L1,
  SymbolId.L5,
  SymbolId.H1,
  SymbolId.L3,
  SymbolId.L4,
  SymbolId.L2,
  SymbolId.H4,
  SymbolId.L1,
  SymbolId.L5,
  SymbolId.H3,
  SymbolId.L4,
  SymbolId.Wild,
  SymbolId.L2,
  SymbolId.L3,
  SymbolId.H2,
  SymbolId.L5,
  SymbolId.L1,
];

export const SPIN_CONFIG = {
  SPEED: 2600,
  BUFFER_ROWS: 4,
  STOP_DURATION: 0.65,
  STOP_BUFFER_ITEMS: 2,
  REEL_STOP_STAGGER: 0.15,
};

export function wrapStripIndex(index: number): number {
  const length = REEL_STRIP.length;
  return ((index % length) + length) % length;
}
