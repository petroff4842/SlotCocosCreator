import { REEL_STRIP, SlotConfig, SymbolId } from "../config/SlotConfig";

import { gridFromStops } from "./GridBuilder";
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
  private stops: number[] = [];

  public get currentStops(): readonly number[] {
    return [...this.stops];
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
    this.stops = [];

    for (let i = 0; i < SlotConfig.REEL_COUNT; i++) {
      const stopIndex = Math.floor(Math.random() * REEL_STRIP.length);
      this.stops.push(stopIndex);
    }

    this.phase = "spinning";
  }

  public requestStop(): void {
    if (this.phase === "spinning") {
      this.phase = "stopping";
    }
  }

  public settle(): SpinResult {
    const grid = gridFromStops(this.stops);
    const wins = evaluateWins(grid);
    const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);

    const result: SpinResult = {
      stops: this.stops,
      grid,
      wins,
      totalWin,
    };

    this.phase = "idle";

    return result;
  }
}
