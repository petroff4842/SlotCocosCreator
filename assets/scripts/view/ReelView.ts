import {
  _decorator,
  Color,
  Component,
  Graphics,
  Node,
  Sprite,
  SpriteFrame,
  UIOpacity,
  UITransform,
  tween,
  Tween,
  Vec3,
} from "cc";
import {
  SlotConfig,
  SymbolId,
  REEL_STRIP,
  SPIN_CONFIG,
  wrapStripIndex,
} from "../config/SlotConfig";

const { ccclass } = _decorator;

type ScrollOffset = { offset: number };

@ccclass("ReelView")
export class ReelView extends Component {
  private frames: Map<SymbolId, SpriteFrame> = new Map();
  private symbolNodes: Node[] = [];
  private renderShift: number = 0;
  private readonly scroll: ScrollOffset = { offset: 0 };
  private spinTween: Tween<ScrollOffset> | null = null;
  private highlightNodes: Node[] = [];
  private highlightTweens: (Tween<Node> | undefined)[] = [];

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
    this.createHighlights();
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

  private createHighlights(): void {
    this.highlightNodes = [];

    for (let row = 0; row < SlotConfig.VISIBLE_ROWS; row++) {
      const highlightNode = new Node(`Highlight_${row}`);
      highlightNode.setParent(this.node);

      const uiTransform = highlightNode.addComponent(UITransform);
      uiTransform.setContentSize(
        SlotConfig.SYMBOL_WIDTH,
        SlotConfig.SYMBOL_HEIGHT,
      );

      const graphics = highlightNode.addComponent(Graphics);
      graphics.fillColor = new Color(255, 230, 80, 120);
      graphics.roundRect(
        -SlotConfig.SYMBOL_WIDTH / 2,
        -SlotConfig.SYMBOL_HEIGHT / 2,
        SlotConfig.SYMBOL_WIDTH,
        SlotConfig.SYMBOL_HEIGHT,
        8,
      );
      graphics.fill();

      const opacity = highlightNode.addComponent(UIOpacity);
      opacity.opacity = 140;

      const y = SlotConfig.SYMBOL_HEIGHT - row * SlotConfig.SYMBOL_HEIGHT;

      highlightNode.setPosition(0, y, 0);
      highlightNode.active = false;

      this.highlightNodes.push(highlightNode);
    }
  }

  private relayout(): void {
    const itemHeight = SlotConfig.SYMBOL_HEIGHT;
    const viewportHeight = SlotConfig.SYMBOL_HEIGHT * SlotConfig.VISIBLE_ROWS;

    const firstIndex =
      Math.floor(this.scroll.offset / itemHeight) - SPIN_CONFIG.BUFFER_ROWS;

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
        ((firstIndex + i) * itemHeight - this.scroll.offset + itemHeight / 2);

      node.setPosition(0, y, 0);
    }
  }

  public setHighlight(row: number, active: boolean): void {
    const highlightNode = this.highlightNodes[row];

    if (!highlightNode) {
      return;
    }

    this.highlightTweens[row]?.stop();
    this.highlightTweens[row] = undefined;

    if (!active) {
      highlightNode.active = false;
      return;
    }

    highlightNode.active = active;

    highlightNode.setScale(1, 1, 1);

    const tweenInstance = tween(highlightNode)
      .to(0.35, { scale: new Vec3(0.96, 0.96, 1) })
      .to(0.35, { scale: new Vec3(0.8, 0.8, 1) })
      .union()
      .repeatForever();

    this.highlightTweens[row] = tweenInstance;
    tweenInstance.start();
  }

  public startSpin(): void {
    if (this.spinTween) {
      return;
    }

    const loopDistance = SlotConfig.SYMBOL_HEIGHT;
    const loopDuration = loopDistance / SPIN_CONFIG.SPEED;

    this.spinTween = tween(this.scroll)
      .by(
        loopDuration,
        { offset: -loopDistance },
        {
          easing: "linear",
          onUpdate: () => this.relayout(),
        },
      )
      .repeatForever()
      .start();
  }

  public stopAt(stopIndex: number): void {
    if (!this.spinTween) {
      return;
    }

    this.spinTween.stop();
    this.spinTween = null;

    const itemHeight = SlotConfig.SYMBOL_HEIGHT;

    const targetItem =
      Math.ceil(this.scroll.offset / itemHeight) -
      SPIN_CONFIG.STOP_BUFFER_ITEMS;

    const targetOffset = targetItem * itemHeight;

    this.renderShift = wrapStripIndex(stopIndex - targetItem);

    tween(this.scroll)
      .to(
        SPIN_CONFIG.STOP_DURATION,
        { offset: targetOffset },
        {
          easing: "backOut",
          onUpdate: () => this.relayout(),
        },
      )
      .call(() => {
        this.scroll.offset = targetOffset;
        this.relayout();
      })
      .start();
  }
}
