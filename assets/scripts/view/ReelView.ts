import {
  _decorator,
  Color,
  Component,
  Graphics,
  Node,
  Sprite,
  SpriteFrame,
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

const HIGHLIGHT_MIN_SCALE = 0.9;
const HIGHLIGHT_MAX_SCALE = 1.05;
const HIGHLIGHT_MIN_OPACITY = 0;
const HIGHLIGHT_MAX_OPACITY = 170;

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
      this.drawHighlight(graphics, 120);

      const y = SlotConfig.SYMBOL_HEIGHT - row * SlotConfig.SYMBOL_HEIGHT;

      highlightNode.setPosition(0, y, 0);
      highlightNode.active = false;

      this.highlightNodes.push(highlightNode);
    }
  }

  private drawHighlight(graphics: Graphics, opacity: number): void {
    graphics.clear();
    graphics.fillColor = new Color(255, 230, 80, opacity);
    graphics.roundRect(
      -SlotConfig.SYMBOL_WIDTH / 2,
      -SlotConfig.SYMBOL_HEIGHT / 2,
      SlotConfig.SYMBOL_WIDTH,
      SlotConfig.SYMBOL_HEIGHT,
      8,
    );
    graphics.fill();
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
    const symbolNode = this.symbolNodes[row + SPIN_CONFIG.BUFFER_ROWS];

    if (!highlightNode || !symbolNode) {
      return;
    }

    this.highlightTweens[row]?.stop();
    this.highlightTweens[row] = undefined;

    const graphics = highlightNode.getComponent(Graphics);

    if (!active) {
      highlightNode.setScale(1, 1, 1);
      symbolNode.setScale(1, 1, 1);
      if (graphics) {
        this.drawHighlight(graphics, HIGHLIGHT_MIN_OPACITY);
      }
      highlightNode.active = false;
      return;
    }

    highlightNode.active = active;

    highlightNode.setScale(1, 1, 1);
    symbolNode.setScale(1, 1, 1);
    if (graphics) {
      this.drawHighlight(graphics, HIGHLIGHT_MIN_OPACITY);
    }

    const updateOpacity = (): void => {
      if (!graphics) {
        return;
      }

      const scale = highlightNode.scale.x;
      symbolNode.setScale(scale, scale, 1);
      const progress = Math.min(
        1,
        Math.max(
          0,
          (scale - HIGHLIGHT_MIN_SCALE) /
            (HIGHLIGHT_MAX_SCALE - HIGHLIGHT_MIN_SCALE),
        ),
      );
      const opacity =
        HIGHLIGHT_MIN_OPACITY +
        (HIGHLIGHT_MAX_OPACITY - HIGHLIGHT_MIN_OPACITY) * progress;
      this.drawHighlight(graphics, opacity);
    };

    const tweenInstance = tween(highlightNode)
      .to(
        0.35,
        {
          scale: new Vec3(HIGHLIGHT_MIN_SCALE, HIGHLIGHT_MIN_SCALE, 1),
        },
        { onUpdate: updateOpacity },
      )
      .to(
        0.35,
        {
          scale: new Vec3(HIGHLIGHT_MAX_SCALE, HIGHLIGHT_MAX_SCALE, 1),
        },
        { onUpdate: updateOpacity },
      )
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
