import { _decorator, Component, Node } from "cc";
import { AssetLoader } from "../services/AsssetsLoader";
import { ReelView } from "../view/ReelView";
import { SymbolId } from "../config/SlotConfig";
const { ccclass } = _decorator;

@ccclass("SlotGame")
export class SlotGame extends Component {
  async start() {
    const frames = await AssetLoader.loadSymbolFrames();
    console.log("Loaded symbol frames:", frames.size);

    const reelNode = new Node("Reel_0");
    reelNode.setParent(this.node);

    const reelView = reelNode.addComponent(ReelView);
    reelView.init(frames, [SymbolId.Wild, SymbolId.L1, SymbolId.H3]);
  }
}
