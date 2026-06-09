import { resources, SpriteFrame } from "cc";
import {
  ALL_SYMBOLS,
  SYMBOL_ASSET_PATHS,
  SymbolId,
} from "../config/SlotConfig";

export type SymbolFrames = Map<SymbolId, SpriteFrame>;

export class AssetLoader {
  public static async loadSymbolFrames(): Promise<SymbolFrames> {
    const frames: SymbolFrames = new Map();

    await Promise.all(
      ALL_SYMBOLS.map(async (symbolId) => {
        const path = SYMBOL_ASSET_PATHS[symbolId];
        const spriteFrame = await this.loadSpriteFrame(path);
        frames.set(symbolId, spriteFrame);
      }),
    );

    return frames;
  }

  private static loadSpriteFrame(path: string): Promise<SpriteFrame> {
    return new Promise((resolve, reject) => {
      resources.load(path, SpriteFrame, (error, spriteFrame) => {
        if (error || !spriteFrame) {
          reject(error ?? new Error(`Failed to load sprite frame: ${path}`));
          return;
        }

        resolve(spriteFrame);
      });
    });
  }
}
