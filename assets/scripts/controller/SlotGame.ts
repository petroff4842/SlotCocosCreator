import { _decorator, Component, Node, UITransform, Button, Label } from "cc";
import { AssetLoader, SymbolFrames } from "../services/AsssetsLoader";
import { ReelView } from "../view/ReelView";
import { SlotConfig, SPIN_CONFIG } from "../config/SlotConfig";
import { SlotModel } from "../model/SlotModel";
const { ccclass, property } = _decorator;

@ccclass("SlotGame")
export class SlotGame extends Component {
  @property(Node)
  private reelsRoot!: Node;

  @property(Button)
  private spinButton!: Button;

  @property(Label)
  private spinLabel!: Label;

  private reels: ReelView[] = [];
  private readonly model = new SlotModel();

  async start() {
    const frames = await AssetLoader.loadSymbolFrames();
    console.log("Loaded symbol frames:", frames.size);

    this.setupReelArea();
    this.createReels(frames);
    this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClicked, this);
    this.updateSpinButtonLabel();
  }

  private setupReelArea(): void {
    const reelArea = this.reelsRoot.parent?.parent;
    const reelMask = this.reelsRoot.parent;

    reelArea
      ?.getComponent(UITransform)
      ?.setContentSize(SlotConfig.REEL_AREA_WIDTH, SlotConfig.REEL_AREA_HEIGHT);
    reelMask
      ?.getComponent(UITransform)
      ?.setContentSize(SlotConfig.REEL_AREA_WIDTH, SlotConfig.REEL_AREA_HEIGHT);
  }

  private createReels(frames: SymbolFrames): void {
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

  private onSpinClicked(): void {
    if (this.model.isStopping) {
      return;
    }
    if (this.model.isIdle) {
      this.spin();
      return;
    }
    if (this.model.isSpinning) {
      console.log("STOP CLICKED");
    }
  }

  private spin(): void {
    this.model.startSpin();
    this.updateSpinButtonLabel();
    this.reels.forEach((reel) => reel.startSpin());

    this.scheduleOnce(() => {
      const result = this.model.generateSpinResult();

      console.log("Generated spin result:", result);
      console.log("Wins:", result.wins);
      console.log("Total win:", result.totalWin);

      this.reels.forEach((reel, index) => {
        this.scheduleOnce(() => {
          reel.stopAt(result.stops[index]);
          if (index === this.reels.length - 1) {
            this.scheduleOnce(() => {
              this.model.settle();
              this.updateSpinButtonLabel();
            }, SPIN_CONFIG.STOP_DURATION);
          }
        }, index * SPIN_CONFIG.REEL_STOP_STAGGER);
      });
    }, 3);
  }

  private updateSpinButtonLabel(): void {
    if (this.model.isIdle) {
      this.spinLabel.string = "SPIN";
      return;
    }

    this.spinLabel.string = "STOP";
  }
}
