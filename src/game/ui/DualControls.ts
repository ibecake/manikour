import Phaser from "phaser";

export type ControlCallbacks = {
  onCycle: () => void;
  onAction: () => void;
};

/**
 * Dual touch buttons (Artifact cycle + Action) with keyboard E/Tab + Space.
 */
export class DualControls {
  private readonly scene: Phaser.Scene;
  private readonly callbacks: ControlCallbacks;
  private artifactBtn!: Phaser.GameObjects.Container;
  private actionBtn!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: ControlCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.buildButtons();
    this.bindKeyboard();
  }

  private buildButtons(): void {
    const { width, height } = this.scene.scale;
    const radius = 56;
    const margin = 36;

    this.artifactBtn = this.makeButton(
      margin + radius,
      height - margin - radius,
      radius,
      0x3d6b52,
      "ARTIFACT\nE / Tab",
      () => this.callbacks.onCycle(),
    );

    this.actionBtn = this.makeButton(
      width - margin - radius,
      height - margin - radius,
      radius,
      0xb86b2e,
      "ACTION\nSpace",
      () => this.callbacks.onAction(),
    );
  }

  private makeButton(
    x: number,
    y: number,
    radius: number,
    color: number,
    label: string,
    onPress: () => void,
  ): Phaser.GameObjects.Container {
    const circle = this.scene.add
      .circle(0, 0, radius, color, 0.88)
      .setStrokeStyle(3, 0xf5e6c8);
    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: "Georgia, serif",
        fontSize: "14px",
        color: "#fff8ea",
        align: "center",
      })
      .setOrigin(0.5);

    const container = this.scene.add
      .container(x, y, [circle, text])
      .setScrollFactor(0)
      .setDepth(200)
      .setSize(radius * 2, radius * 2)
      .setInteractive(
        new Phaser.Geom.Circle(0, 0, radius),
        Phaser.Geom.Circle.Contains,
      );

    container.on("pointerdown", () => {
      circle.setFillStyle(color, 1);
      onPress();
    });
    container.on("pointerup", () => circle.setFillStyle(color, 0.88));
    container.on("pointerout", () => circle.setFillStyle(color, 0.88));

    return container;
  }

  private bindKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on("keydown-SPACE", () => this.callbacks.onAction());
    kb.on("keydown-E", () => this.callbacks.onCycle());
    kb.on("keydown-TAB", (event: KeyboardEvent) => {
      event.preventDefault();
      this.callbacks.onCycle();
    });
  }

  destroy(): void {
    this.artifactBtn.destroy();
    this.actionBtn.destroy();
  }
}
