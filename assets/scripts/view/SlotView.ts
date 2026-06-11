import { Button, Label, Tween, tween } from "cc";

export class SlotView {
  private readonly winCounter = { value: 0 };
  constructor(
    private readonly spinButton: Button,
    private readonly spinLabel: Label,
    private readonly winLabel: Label,
  ) {}

  public updateWinLabel(totalWin: number): void {
    this.winLabel.string = `WIN: ${totalWin}`;
  }

  public updateSpinButtonLabel(isSpinning: boolean): void {
    this.spinLabel.string = isSpinning ? "STOP" : "SPIN";
  }

  public setButtonInteractable(interactable: boolean): void {
    this.spinButton.interactable = interactable;
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
