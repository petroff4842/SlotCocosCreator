import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  UITransform,
} from "cc";
import { SlotConfig, SymbolId } from "../config/SlotConfig";

const { ccclass } = _decorator;

@ccclass("ReelView")
export class ReelView extends Component {
  private frames: Map<SymbolId, SpriteFrame> = new Map();
  private symbolNodes: Node[] = [];

  public init(frames: Map<SymbolId, SpriteFrame>, symbols: SymbolId[]): void {
    this.frames = frames;

    const uiTransform =
      this.node.getComponent(UITransform) ??
      this.node.addComponent(UITransform);

    uiTransform.setContentSize(
      SlotConfig.SYMBOL_WIDTH,
      SlotConfig.SYMBOL_HEIGHT * SlotConfig.VISIBLE_ROWS,
    );

    this.createSymbols(symbols);
  }

  public setSymbols(symbols: SymbolId[]): void {
    for (let row = 0; row < this.symbolNodes.length; row++) {
      const node = this.symbolNodes[row];
      const sprite = node.getComponent(Sprite);

      if (!sprite) {
        continue;
      }

      sprite.spriteFrame = this.frames.get(symbols[row]) ?? null;
    }
  }

  private createSymbols(symbols: SymbolId[]): void {
    this.symbolNodes = [];

    for (let row = 0; row < SlotConfig.VISIBLE_ROWS; row++) {
      const symbolNode = new Node(`Symbol_${row}`);
      symbolNode.setParent(this.node);

      const y = SlotConfig.SYMBOL_HEIGHT - row * SlotConfig.SYMBOL_HEIGHT;

      symbolNode.setPosition(0, y, 0);

      const uiTransform = symbolNode.addComponent(UITransform);
      uiTransform.setContentSize(
        SlotConfig.SYMBOL_WIDTH,
        SlotConfig.SYMBOL_HEIGHT,
      );

      const sprite = symbolNode.addComponent(Sprite);
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;

      this.symbolNodes.push(symbolNode);
    }

    this.setSymbols(symbols);
  }
}
