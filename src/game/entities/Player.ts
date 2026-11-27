import Phaser from "phaser";
import type { FormStats } from "../forms/types";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private form: FormStats;
  private grounded = false;

  constructor(scene: Phaser.Scene, x: number, y: number, form: FormStats) {
    this.form = form;
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setBounce(0.05);
    this.sprite.setDragX(800);
    this.sprite.setMaxVelocity(420, 1200);
    this.applyForm(form);
  }

  applyForm(form: FormStats): void {
    this.form = form;
    this.sprite.setTint(form.color);
  }

  setGrounded(value: boolean): void {
    this.grounded = value;
  }

  /** Fire current form skill (jump for Phase 0 stubs). */
  action(): void {
    if (!this.grounded) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(this.form.jumpVelocity);
    // Cheetah gets a forward boost; frog a smaller one
    if (this.form.id === "cheetah") {
      body.setVelocityX(Math.max(body.velocity.x, 280 * this.form.speed));
    } else if (this.form.id === "frog") {
      body.setVelocityX(Math.max(body.velocity.x, 160 * this.form.speed));
    }
  }

  updateMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const speed = 220 * this.form.speed;
    if (cursors?.left.isDown) {
      body.setVelocityX(-speed);
    } else if (cursors?.right.isDown) {
      body.setVelocityX(speed * 0.6);
    }
    if (cursors?.up.isDown) {
      body.setVelocityY(Math.min(body.velocity.y, -speed * 0.35));
    } else if (cursors?.down.isDown) {
      body.setVelocityY(Math.max(body.velocity.y, speed * 0.25));
    }
  }
}
