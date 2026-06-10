import {
  REEL_STRIP,
  SlotConfig,
  SymbolId,
  gridFromStops,
} from "../config/SlotConfig";

export interface SpinResult {
  stops: number[];
  grid: SymbolId[][];
}

export class SlotModel {
  public generateSpinResult(): SpinResult {
    const stops: number[] = [];

    for (let i = 0; i < SlotConfig.REEL_COUNT; i++) {
      const stopIndex = Math.floor(Math.random() * REEL_STRIP.length);
      stops.push(stopIndex);
    }

    return {
      stops,
      grid: gridFromStops(stops),
    };
  }
}
