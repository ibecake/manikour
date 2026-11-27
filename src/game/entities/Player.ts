import Phaser from "phaser";
import type { FormStats } from "../forms/types";

/** Fraction of upward velocity kept when releasing jump early (short-hop). */
const SHORT_HOP_CUT = 0.45;

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private form: FormStats;
  private grounded = false;
  /** Remaining mid-air jumps (refreshed on land). */
  private airJumpsLeft = 0;
  /** True from jump impulse until action released or apex. */
  private jumpHeld = false;

  constructor(scene: Phaser.Scene, x: number, y: number, form: FormStats) {
    this.form = form;
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setBounce(0);
    this.sprite.setDragX(800);
    this.sprite.setMaxVelocity(420, 1200);
    this.applyForm(form);
  }

  applyForm(form: FormStats): void {
    this.form = form;
    this.sprite.setTint(form.color);
    // Cap remaining air jumps to the new form's allowance
    this.airJumpsLeft = Math.min(this.airJumpsLeft, form.airJumps);
  }

  setGrounded(value: boolean): void {
    if (value && !this.grounded) {
      this.airJumpsLeft = this.form.airJumps;
      this.jumpHeld = false;
    }
    this.grounded = value;
  }

  /**
   * Fire current form skill on press edge only (jump for Phase 0 stubs).
   * Applies a one-shot impulse — never a sustained upward force.
   */
  action(): void {
    const canGroundJump = this.grounded;
    const canAirJump = !this.grounded && this.airJumpsLeft > 0;
    if (!canGroundJump && !canAirJump) return;

    if (canAirJump) {
      this.airJumpsLeft -= 1;
    } else {
      // Left the ground via jump; air jumps available after this
      this.airJumpsLeft = this.form.airJumps;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(this.form.jumpVelocity);
    this.jumpHeld = true;
    this.grounded = false;

    // Cheetah gets a forward boost; frog a smaller one
    if (this.form.id === "cheetah") {
      body.setVelocityX(Math.max(body.velocity.x, 280 * this.form.speed));
    } else if (this.form.id === "frog") {
      body.setVelocityX(Math.max(body.velocity.x, 160 * this.form.speed));
    }
  }

  /**
   * Early release short-hop: cut residual upward velocity once.
   * Does not apply any force while held — only trims on release.
   */
  actionReleased(): void {
    if (!this.jumpHeld) return;
    this.jumpHeld = false;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * SHORT_HOP_CUT);
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
    // No sustained vertical force from Up/Down — gravity owns Y while airborne.
    // Down can nudge slightly when grounded for crouch feel later; skip for now.
  }
}
