import { REEL_STRIP, SlotConfig, SymbolId } from "../config/SlotConfig";

export function wrapStripIndex(index: number): number {
  const length = REEL_STRIP.length;
  return ((index % length) + length) % length;
}

export function gridFromStops(stops: number[]): SymbolId[][] {
  const grid: SymbolId[][] = [];

  for (let row = 0; row < SlotConfig.VISIBLE_ROWS; row++) {
    grid[row] = [];

    for (let reel = 0; reel < SlotConfig.REEL_COUNT; reel++) {
      const stripIndex = wrapStripIndex(stops[reel] + row);

      grid[row][reel] = REEL_STRIP[stripIndex];
    }
  }

  return grid;
}
