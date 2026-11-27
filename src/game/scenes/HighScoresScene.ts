import Phaser from "phaser";

type ScoreRow = { name: string; score: number; created_at?: string };

export class HighScoresScene extends Phaser.Scene {
  constructor() {
    super("HighScores");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0b1a14).setOrigin(0);

    this.add
      .text(width / 2, 80, "HIGH SCORES", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f3e6c8",
      })
      .setOrigin(0.5);

    const list = this.add
      .text(width / 2, 160, "Loading…", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#9bb5a6",
        align: "center",
      })
      .setOrigin(0.5, 0);

    void this.loadScores().then((rows) => {
      if (rows.length === 0) {
        list.setText("No scores yet.\nBeat a run and submit.");
        return;
      }
      list.setText(
        rows
          .slice(0, 10)
          .map((r, i) => `${i + 1}. ${r.name.padEnd(12, " ")}  ${r.score} m`)
          .join("\n"),
      );
    });

    const back = this.add
      .rectangle(width / 2, height - 100, 240, 52, 0x2a4a38, 0.95)
      .setStrokeStyle(2, 0xf0d080)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height - 100, "Back", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#f5efe0",
      })
      .setOrigin(0.5);
    back.on("pointerdown", () => this.scene.start("Menu"));
  }

  private async loadScores(): Promise<ScoreRow[]> {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = (await res.json()) as { scores?: ScoreRow[] };
        if (data.scores?.length) return data.scores;
      }
    } catch {
      // fall through to local
    }
    const local: ScoreRow[] = JSON.parse(localStorage.getItem("manikour-local-scores") ?? "[]");
    return local;
  }
}
