import Phaser from "phaser";
import type { FormStats } from "../forms/types";

const SLOT_COUNT = 5;

/**
 * Five artifact slots. Empty slots = human baseline.
 * Phase 0: slot 0 mirrors the active form stub; others empty.
 */
export class ArtifactHud {
  private readonly slotBgs: Phaser.GameObjects.Rectangle[] = [];
  private readonly slotLabels: Phaser.GameObjects.Text[] = [];
  private readonly formLabel: Phaser.GameObjects.Text;
  private activeSlot = 0;
  /** Slot contents: form id string or null for empty. */
  private slots: (string | null)[] = Array(SLOT_COUNT).fill(null);

  constructor(scene: Phaser.Scene) {
    const startX = 48;
    const y = 48;
    const size = 56;
    const gap = 10;

    for (let i = 0; i < SLOT_COUNT; i++) {
      const x = startX + i * (size + gap);
      const bg = scene.add
        .rectangle(x, y, size, size, 0x1a2e24, 0.85)
        .setStrokeStyle(2, 0x6a8f7a)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(100);
      const label = scene.add
        .text(x + size / 2, y + size / 2, String(i + 1), {
          fontFamily: "Georgia, serif",
          fontSize: "18px",
          color: "#9bb5a6",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
      this.slotBgs.push(bg);
      this.slotLabels.push(label);
    }

    this.formLabel = scene.add
      .text(startX, y + size + 12, "Human", {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#d7e8dc",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.highlightActive();
  }

  /** Tetris-style cycle: advance active slot 0→4 wrap. */
  cycleSlot(): number {
    this.activeSlot = (this.activeSlot + 1) % SLOT_COUNT;
    this.highlightActive();
    return this.activeSlot;
  }

  getActiveSlot(): number {
    return this.activeSlot;
  }

  /** Put a form stub into the active slot (Phase 0 demo). */
  setActiveContent(form: FormStats | null): void {
    this.slots[this.activeSlot] = form?.id ?? null;
    const label = this.slotLabels[this.activeSlot];
    if (label) {
      label.setText(form ? form.label.slice(0, 1) : String(this.activeSlot + 1));
      label.setColor(form ? "#fff4d6" : "#9bb5a6");
    }
    this.refreshFormLabel(form);
  }

  setFormDisplay(form: FormStats): void {
    this.refreshFormLabel(form);
  }

  private refreshFormLabel(form: FormStats | null): void {
    if (form) {
      this.formLabel.setText(`${form.label} — ${form.skillHint}`);
    } else {
      this.formLabel.setText("Human — baseline");
    }
  }

  private highlightActive(): void {
    this.slotBgs.forEach((bg, i) => {
      bg.setStrokeStyle(i === this.activeSlot ? 3 : 2, i === this.activeSlot ? 0xf0d080 : 0x6a8f7a);
      bg.setFillStyle(i === this.activeSlot ? 0x2a4a38 : 0x1a2e24, 0.9);
    });
  }
}
