import Phaser from "phaser";

export type ControlCallbacks = {
  onCycle: () => void;
  /** Jump / skill — called once per press edge (never on hold/repeat). */
  onAction: () => void;
  /** Optional short-hop: early release after a jump. */
  onActionRelease?: () => void;
};

/**
 * Dual touch buttons (Artifact cycle + Action) with keyboard E/Tab + Space.
 * Action is edge-triggered so holding never sustains upward force.
 */
export class DualControls {
  private readonly scene: Phaser.Scene;
  private readonly callbacks: ControlCallbacks;
  private artifactBtn!: Phaser.GameObjects.Container;
  private actionBtn!: Phaser.GameObjects.Container;
  private actionHeld = false;
  private spaceKey?: Phaser.Input.Keyboard.Key;

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

    this.actionBtn = this.makeActionButton(
      width - margin - radius,
      height - margin - radius,
      radius,
      0xb86b2e,
      "ACTION\nSpace",
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

    // Container hit areas are top-left origin — center the circle on the button
    const container = this.scene.add
      .container(x, y, [circle, text])
      .setScrollFactor(0)
      .setDepth(200)
      .setSize(radius * 2, radius * 2)
      .setInteractive(
        new Phaser.Geom.Circle(radius, radius, radius),
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

  private makeActionButton(
    x: number,
    y: number,
    radius: number,
    color: number,
    label: string,
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
        new Phaser.Geom.Circle(radius, radius, radius),
        Phaser.Geom.Circle.Contains,
      );

    container.on("pointerdown", () => {
      circle.setFillStyle(color, 1);
      this.pressAction();
    });
    container.on("pointerup", () => {
      circle.setFillStyle(color, 0.88);
      this.releaseAction();
    });
    container.on("pointerout", () => {
      circle.setFillStyle(color, 0.88);
      this.releaseAction();
    });

    return container;
  }

  private pressAction(): void {
    if (this.actionHeld) return;
    this.actionHeld = true;
    this.callbacks.onAction();
  }

  private releaseAction(): void {
    if (!this.actionHeld) return;
    this.actionHeld = false;
    this.callbacks.onActionRelease?.();
  }

  private bindKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // Key 'down' is edge-only (Phaser ignores OS key-repeat once isDown)
    this.spaceKey.on(
      "down",
      (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent) => {
        event.preventDefault();
        if (event.repeat) return;
        this.pressAction();
      },
    );
    this.spaceKey.on("up", () => this.releaseAction());

    kb.on("keydown-E", () => this.callbacks.onCycle());
    kb.on("keydown-TAB", (event: KeyboardEvent) => {
      event.preventDefault();
      this.callbacks.onCycle();
    });
  }

  destroy(): void {
    this.spaceKey?.destroy();
    this.artifactBtn.destroy();
    this.actionBtn.destroy();
  }
}
