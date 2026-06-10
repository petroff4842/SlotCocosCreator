import { _decorator, Component, Node } from "cc";
import { AssetLoader } from "../services/AsssetsLoader";
import { ReelView } from "../view/ReelView";
import { SlotConfig, SymbolId } from "../config/SlotConfig";
const { ccclass, property } = _decorator;

@ccclass("SlotGame")
export class SlotGame extends Component {
  @property(Node)
  private reelsRoot!: Node;

  async start() {
    const frames = await AssetLoader.loadSymbolFrames();
    console.log("Loaded symbol frames:", frames.size);

    const totalWidth = SlotConfig.REEL_COUNT * SlotConfig.SYMBOL_WIDTH;

    const startX = -totalWidth / 2 + SlotConfig.SYMBOL_WIDTH / 2;

    for (let reelIndex = 0; reelIndex < SlotConfig.REEL_COUNT; reelIndex++) {
      const reelNode = new Node(`Reel_${reelIndex}`);
      reelNode.setParent(this.reelsRoot);

      reelNode.setPosition(startX + reelIndex * SlotConfig.SYMBOL_WIDTH, 0, 0);

      const reelView = reelNode.addComponent(ReelView);
      reelView.init(frames, [SymbolId.Wild, SymbolId.L1, SymbolId.H3]);
    }
  }
}
