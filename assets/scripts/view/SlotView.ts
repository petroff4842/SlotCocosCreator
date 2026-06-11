import { Button, Label, Node, Tween, tween, UITransform } from "cc";
import { ReelView } from "./ReelView";
import { SlotConfig } from "../config/SlotConfig";
import { SymbolFrames } from "../services/AsssetsLoader";

export class SlotView {
  private readonly winCounter = { value: 0 };
  private readonly reels: ReelView[] = [];
  constructor(
    private readonly reelsRoot: Node,
    private readonly spinButton: Button,
    private readonly spinLabel: Label,
    private readonly winLabel: Label,
  ) {}

  public setupReelArea(): void {
    const reelArea = this.reelsRoot.parent?.parent;
    const reelMask = this.reelsRoot.parent;

    reelArea
      ?.getComponent(UITransform)
      ?.setContentSize(SlotConfig.REEL_AREA_WIDTH, SlotConfig.REEL_AREA_HEIGHT);
    reelMask
      ?.getComponent(UITransform)
      ?.setContentSize(SlotConfig.REEL_AREA_WIDTH, SlotConfig.REEL_AREA_HEIGHT);
  }

  public createReels(frames: SymbolFrames): void {
    const totalWidth = SlotConfig.REEL_COUNT * SlotConfig.SYMBOL_WIDTH;
    const startX = -totalWidth / 2 + SlotConfig.SYMBOL_WIDTH / 2;

    for (let reelIndex = 0; reelIndex < SlotConfig.REEL_COUNT; reelIndex++) {
      const reelNode = new Node(`Reel_${reelIndex}`);
      reelNode.setParent(this.reelsRoot);

      reelNode.setPosition(startX + reelIndex * SlotConfig.SYMBOL_WIDTH, 0, 0);

      const reelView = reelNode.addComponent(ReelView);
      reelView.init(frames);
      this.reels.push(reelView);
    }
  }

  public startReelsSpin(): void {
    this.reels.forEach((reel) => reel.startSpin());
  }

  public stopReel(reelIndex: number, stopIndex: number): void {
    this.reels[reelIndex]?.stopAt(stopIndex);
  }

  private updateWinLabel(totalWin: number): void {
    this.winLabel.string = `WIN: ${totalWin}`;
  }

  public updateSpinButtonLabel(isSpinning: boolean): void {
    this.spinLabel.string = isSpinning ? "STOP" : "SPIN";
  }

  public resetWin(): void {
    Tween.stopAllByTarget(this.winCounter);
    this.winCounter.value = 0;
    this.updateWinLabel(0);
  }

  public animateWin(totalWin: number): void {
    Tween.stopAllByTarget(this.winCounter);

    if (totalWin <= 0) {
      this.resetWin();
      return;
    }

    this.winCounter.value = 0;

    tween(this.winCounter)
      .to(
        0.6,
        { value: totalWin },
        {
          onUpdate: () => {
            this.updateWinLabel(Math.floor(this.winCounter.value));
          },
        },
      )
      .call(() => {
        this.updateWinLabel(totalWin);
      })
      .start();
  }
}
