import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(0, 0, width, height, 0x0b1a14)
      .setOrigin(0);

    // Soft atmospheric wash
    this.add
      .rectangle(width / 2, height * 0.35, width * 1.2, height * 0.55, 0x163528, 0.55)
      .setBlendMode(Phaser.BlendModes.ADD);

    const brand = this.add
      .text(width / 2, height * 0.28, "MANIKOUR", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "72px",
        color: "#f3e6c8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const tag = this.add
      .text(width / 2, height * 0.38, "Become the animal the path demands.", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#9bb5a6",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: brand,
      alpha: 1,
      y: brand.y - 8,
      duration: 700,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: tag,
      alpha: 1,
      delay: 200,
      duration: 600,
    });

    this.makeMenuButton(width / 2, height * 0.55, "Play", () => {
      this.scene.start("Play");
    });
    this.makeMenuButton(width / 2, height * 0.64, "High Scores", () => {
      this.scene.start("HighScores");
    });

    this.add
      .text(width / 2, height * 0.88, "E / Tab cycle · Space action", {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#6a8f7a",
      })
      .setOrigin(0.5);
  }

  private makeMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 280, 56, 0x2a4a38, 0.95)
      .setStrokeStyle(2, 0xf0d080)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        color: "#f5efe0",
      })
      .setOrigin(0.5);

    bg.on("pointerover", () => bg.setFillStyle(0x3a5f48, 1));
    bg.on("pointerout", () => bg.setFillStyle(0x2a4a38, 0.95));
    bg.on("pointerdown", onClick);
  }
}
