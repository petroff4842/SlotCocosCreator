import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  UITransform,
} from "cc";
import {
  SlotConfig,
  SymbolId,
  REEL_STRIP,
  SPIN_CONFIG,
  wrapStripIndex,
} from "../config/SlotConfig";

const { ccclass } = _decorator;

@ccclass("ReelView")
export class ReelView extends Component {
  private frames: Map<SymbolId, SpriteFrame> = new Map();
  private symbolNodes: Node[] = [];
  private scrollOffset: number = 0;
  private renderShift: number = 0;

  public init(frames: Map<SymbolId, SpriteFrame>): void {
    this.frames = frames;

    const uiTransform =
      this.node.getComponent(UITransform) ??
      this.node.addComponent(UITransform);

    uiTransform.setContentSize(
      SlotConfig.SYMBOL_WIDTH,
      SlotConfig.SYMBOL_HEIGHT * SlotConfig.VISIBLE_ROWS,
    );

    this.createSymbols();
  }

  private createSymbols(): void {
    const totalRows = SlotConfig.VISIBLE_ROWS + SPIN_CONFIG.BUFFER_ROWS * 2;

    this.symbolNodes = [];

    for (let row = 0; row < totalRows; row++) {
      const symbolNode = new Node(`Symbol_${row}`);
      symbolNode.setParent(this.node);
      symbolNode.setPosition(0, 0, 0);

      const uiTransform = symbolNode.addComponent(UITransform);
      uiTransform.setContentSize(
        SlotConfig.SYMBOL_WIDTH,
        SlotConfig.SYMBOL_HEIGHT,
      );

      const sprite = symbolNode.addComponent(Sprite);
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;

      this.symbolNodes.push(symbolNode);
    }

    this.relayout();
  }

  private relayout(): void {
    const itemHeight = SlotConfig.SYMBOL_HEIGHT;
    const viewportHeight = SlotConfig.SYMBOL_HEIGHT * SlotConfig.VISIBLE_ROWS;

    const firstIndex =
      Math.floor(this.scrollOffset / itemHeight) - SPIN_CONFIG.BUFFER_ROWS;

    for (let i = 0; i < this.symbolNodes.length; i++) {
      const node = this.symbolNodes[i];

      const stripIndex = wrapStripIndex(firstIndex + i + this.renderShift);
      const symbolId = REEL_STRIP[stripIndex];

      const sprite = node.getComponent(Sprite);
      if (sprite) {
        sprite.spriteFrame = this.frames.get(symbolId) ?? null;
      }

      const y =
        viewportHeight / 2 -
        ((firstIndex + i) * itemHeight - this.scrollOffset + itemHeight / 2);

      node.setPosition(0, y, 0);
    }
  }
}
