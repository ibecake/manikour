import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    // Placeholder textures generated at runtime in create()
  }

  create(): void {
    this.createPlaceholderTextures();
    this.scene.start("Menu");
  }

  private createPlaceholderTextures(): void {
    if (!this.textures.exists("player")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(0, 0, 40, 56, 8);
      g.generateTexture("player", 40, 56);
      g.destroy();
    }

    if (!this.textures.exists("ground")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3a5a44, 1);
      g.fillRect(0, 0, 64, 64);
      g.lineStyle(2, 0x2a4030, 1);
      g.strokeRect(0, 0, 64, 64);
      g.generateTexture("ground", 64, 64);
      g.destroy();
    }
  }
}
