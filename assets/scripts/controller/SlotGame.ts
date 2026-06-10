import { _decorator, Component, Node, UITransform } from "cc";
import { AssetLoader, SymbolFrames } from "../services/AsssetsLoader";
import { ReelView } from "../view/ReelView";
import { SlotConfig } from "../config/SlotConfig";
const { ccclass, property } = _decorator;

@ccclass("SlotGame")
export class SlotGame extends Component {
  @property(Node)
  private reelsRoot!: Node;

  async start() {
    const frames = await AssetLoader.loadSymbolFrames();
    console.log("Loaded symbol frames:", frames.size);

    this.setupReelArea();
    this.createReels(frames);
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
      if (reelIndex === 0) {
        reelView.startSpin();
        this.scheduleOnce(() => {
          reelView.stopSpin();
        }, 4);
      }
    }
  }
}
