import { REEL_STRIP, SlotConfig } from "../config/SlotConfig";

export class SlotModel {
  public generateSpinResult(): number[] {
    const stops: number[] = [];

    for (let i = 0; i < SlotConfig.REEL_COUNT; i++) {
      const stopIndex = Math.floor(Math.random() * REEL_STRIP.length);
      stops.push(stopIndex);
    }

    return stops;
  }
}
