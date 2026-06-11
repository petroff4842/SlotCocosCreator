import {
  REEL_STRIP,
  SlotConfig,
  SymbolId,
  gridFromStops,
} from "../config/SlotConfig";

import { evaluateWins, LineWin } from "./WinEvaluator";

export type SpinPhase = "idle" | "spinning" | "stopping";

export interface SpinResult {
  stops: number[];
  grid: SymbolId[][];
  wins: LineWin[];
  totalWin: number;
}

export class SlotModel {
  private phase: SpinPhase = "idle";
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

  public get isIdle(): boolean {
    return this.phase === "idle";
  }

  public get isSpinning(): boolean {
    return this.phase === "spinning";
  }

  public get isStopping(): boolean {
    return this.phase === "stopping";
  }

  public startSpin(): void {
    this.phase = "spinning";
  }

  public requestStop(): void {
    if (this.phase === "spinning") {
      this.phase = "stopping";
    }
  }

  public settle(): void {
    this.phase = "idle";
  }
}
