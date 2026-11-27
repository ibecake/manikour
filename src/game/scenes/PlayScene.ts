import Phaser from "phaser";
import { FormRegistry } from "../forms/FormRegistry";
import { FORMS } from "../forms/types";
import { Player } from "../entities/Player";
import { ArtifactHud } from "../ui/ArtifactHud";
import { DualControls } from "../ui/DualControls";

type WorldMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Array<{
    name: string;
    width: number;
    height: number;
    data: number[];
  }>;
};

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private forms = new FormRegistry();
  private hud!: ArtifactHud;
  private controls!: DualControls;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private distance = 0;
  private distanceText!: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private scrollSpeed = 80;
  private worldWidth = 720;
  private dead = false;

  constructor() {
    super("Play");
  }

  create(): void {
    this.dead = false;
    this.distance = 0;
    this.forms.reset();

    const map = this.cache.json.get("world") as WorldMap | undefined;
    this.buildWorld(map);

    this.player = new Player(this, 160, 400, this.forms.current);
    this.physics.add.collider(this.player.sprite, this.ground, () => {
      this.player.setGrounded(true);
    });

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.scale.height);

    this.hud = new ArtifactHud(this);
    this.hud.setActiveContent(FORMS.human);
    this.hud.setFormDisplay(this.forms.current);

    this.controls = new DualControls(this, {
      onCycle: () => this.cycleArtifact(),
      onAction: () => this.player.action(),
      onActionRelease: () => this.player.actionReleased(),
    });

    this.distanceText = this.add
      .text(this.scale.width - 24, 36, "0 m", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#f3e6c8",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.cursors = this.input.keyboard?.createCursorKeys();

    this.add
      .text(24, this.scale.height - 140, "Phase 0 placeholder — ground + forms", {
        fontFamily: "Georgia, serif",
        fontSize: "14px",
        color: "#6a8f7a",
      })
      .setScrollFactor(0)
      .setDepth(90);
  }

  update(_time: number, delta: number): void {
    if (this.dead) return;

    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    this.player.setGrounded(body.blocked.down || body.touching.down);
    this.player.updateMovement(this.cursors);

    // Auto-scroll right; speed rises with distance
    this.scrollSpeed = 80 + this.distance * 0.4;
    this.player.sprite.x += (this.scrollSpeed * delta) / 1000;

    this.distance = Math.max(0, (this.player.sprite.x - 160) / 32);
    this.distanceText.setText(`${Math.floor(this.distance)} m`);

    // Death: fall or leave left edge of camera
    const cam = this.cameras.main;
    if (
      this.player.sprite.y > this.scale.height + 80 ||
      this.player.sprite.x < cam.scrollX - 40
    ) {
      this.die();
    }
  }

  private cycleArtifact(): void {
    this.hud.cycleSlot();
    const form = this.forms.cycle();
    this.player.applyForm(form);
    this.hud.setActiveContent(form);
    this.hud.setFormDisplay(form);
  }

  private die(): void {
    this.dead = true;
    this.controls.destroy();
    this.scene.start("GameOver", { score: Math.floor(this.distance) });
  }

  private buildWorld(map: WorldMap | undefined): void {
    this.ground = this.physics.add.staticGroup();

    if (!map) {
      // Fallback flat ground if world.json not preloaded
      this.worldWidth = 4000;
      for (let x = 0; x < this.worldWidth; x += 64) {
        this.ground.create(x + 32, this.scale.height - 32, "ground");
      }
      this.physics.world.setBounds(0, 0, this.worldWidth, this.scale.height);
      return;
    }

    const groundLayer = map.layers.find((l) => l.name === "ground");
    const tw = map.tilewidth;
    const th = map.tileheight;
    this.worldWidth = map.width * tw;
    this.physics.world.setBounds(0, 0, this.worldWidth, map.height * th);
    this.cameras.main.setBounds(0, 0, this.worldWidth, map.height * th);

    if (!groundLayer) return;

    for (let i = 0; i < groundLayer.data.length; i++) {
      const tile = groundLayer.data[i]!;
      if (tile === 0) continue;
      const col = i % groundLayer.width;
      const row = Math.floor(i / groundLayer.width);
      const x = col * tw + tw / 2;
      const y = row * th + th / 2;
      const block = this.ground.create(x, y, "ground");
      block.setDisplaySize(tw, th);
      block.refreshBody();
    }
  }

  preload(): void {
    this.load.json("world", "map/world.json");
  }
}
