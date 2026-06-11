import {
  REEL_STRIP,
  SlotConfig,
  SymbolId,
  gridFromStops,
} from "../config/SlotConfig";

import { evaluateWins, LineWin } from "./WinEvaluator";

export interface SpinResult {
  stops: number[];
  grid: SymbolId[][];
  wins: LineWin[];
  totalWin: number;
}

export class SlotModel {
  public generateSpinResult(): SpinResult {
    const stops: number[] = [];

    for (let i = 0; i < SlotConfig.REEL_COUNT; i++) {
      const stopIndex = Math.floor(Math.random() * REEL_STRIP.length);
      stops.push(stopIndex);
    }
    const grid = gridFromStops(stops);
    const wins = evaluateWins(grid);
    const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);

    return {
      stops,
      grid,
      wins,
      totalWin,
    };
  }
}
