import { _decorator, Component, Node, Button, Label } from "cc";
import { AssetLoader } from "../services/AsssetsLoader";
import { SPIN_CONFIG } from "../config/SlotConfig";
import { SlotModel } from "../model/SlotModel";
import { SlotView } from "../view/SlotView";
const { ccclass, property } = _decorator;

@ccclass("SlotGame")
export class SlotGame extends Component {
  @property(Node)
  private reelsRoot!: Node;

  @property(Button)
  private spinButton!: Button;

  @property(Label)
  private spinLabel!: Label;

  @property(Label)
  private winLabel!: Label;

  private readonly model = new SlotModel();
  private view!: SlotView;

  async start() {
    this.view = new SlotView(
      this.reelsRoot,
      this.spinButton,
      this.spinLabel,
      this.winLabel,
    );

    const frames = await AssetLoader.loadSymbolFrames();
    console.log("Loaded symbol frames:", frames.size);

    this.view.setupReelArea();
    this.view.createReels(frames);
    this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClicked, this);
    this.view.updateSpinButtonLabel(false);
    this.view.resetWin();
  }

  private onSpinClicked(): void {
    if (this.model.isStopping) {
      return;
    }
    if (this.model.isIdle) {
      this.spin();
      return;
    }
    if (this.model.isSpinning) {
      this.stop();
    }
  }

  private spin(): void {
    this.model.startSpin();
    this.view.updateSpinButtonLabel(true);
    this.view.resetWin();
    this.view.startReelsSpin();

    const autoStopDelay = SPIN_CONFIG.AUTO_STOP_DELAY;
    if ((autoStopDelay ?? 0) > 0) {
      this.scheduleOnce(this.autoStop, autoStopDelay);
    }
  }

  private stop(): void {
    this.unschedule(this.autoStop);
    this.model.requestStop();

    const stops = this.model.currentStops;

    for (let index = 0; index < stops.length; index++) {
      this.scheduleOnce(() => {
        this.view.stopReel(index, stops[index]);

        if (index === stops.length - 1) {
          this.scheduleOnce(() => {
            const result = this.model.settle();

            console.log("Spin result:", result);
            console.log("Wins:", result.wins);
            console.log("Total win:", result.totalWin);

            this.view.animateWin(result.totalWin);
            this.view.highlightWins(result.wins);
            this.view.updateSpinButtonLabel(false);
          }, SPIN_CONFIG.STOP_DURATION);
        }
      }, index * SPIN_CONFIG.REEL_STOP_STAGGER);
    }
  }

  private autoStop(): void {
    console.log("Autostop triggered");
    if (this.model.isSpinning) {
      this.stop();
    }
  }
}
