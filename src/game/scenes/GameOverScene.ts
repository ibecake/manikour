import Phaser from "phaser";

type GameOverData = {
  score?: number;
};

export class GameOverScene extends Phaser.Scene {
  private score = 0;

  constructor() {
    super("GameOver");
  }

  init(data: GameOverData): void {
    this.score = data.score ?? 0;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0b1a14, 0.96).setOrigin(0);

    this.add
      .text(width / 2, height * 0.28, "GAME OVER", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#f3e6c8",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.38, `${this.score} m`, {
        fontFamily: "Georgia, serif",
        fontSize: "40px",
        color: "#f0d080",
      })
      .setOrigin(0.5);

    this.makeButton(width / 2, height * 0.52, "Submit Score", () => {
      void this.submitScore();
    });
    this.makeButton(width / 2, height * 0.62, "High Scores", () => {
      this.scene.start("HighScores");
    });
    this.makeButton(width / 2, height * 0.72, "Play Again", () => {
      this.scene.start("Play");
    });
    this.makeButton(width / 2, height * 0.82, "Menu", () => {
      this.scene.start("Menu");
    });
  }

  private async submitScore(): Promise<void> {
    const name = window.prompt("Enter your name (max 16 chars)", "Runner")?.trim() ?? "";
    if (!name) return;

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.slice(0, 16), score: this.score }),
      });
      if (!res.ok) {
        console.warn("Score submit failed", await res.text());
      }
      this.scene.start("HighScores");
    } catch (err) {
      console.warn("Score API unavailable (local stub)", err);
      // Persist locally as Phase 0 fallback
      const key = "manikour-local-scores";
      const existing: Array<{ name: string; score: number }> = JSON.parse(
        localStorage.getItem(key) ?? "[]",
      );
      existing.push({ name: name.slice(0, 16), score: this.score });
      existing.sort((a, b) => b.score - a.score);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
      this.scene.start("HighScores");
    }
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 280, 52, 0x2a4a38, 0.95)
      .setStrokeStyle(2, 0xf0d080)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#f5efe0",
      })
      .setOrigin(0.5);
    bg.on("pointerdown", onClick);
  }
}
