import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { PlayScene } from "./game/scenes/PlayScene";
import { GameOverScene } from "./game/scenes/GameOverScene";
import { HighScoresScene } from "./game/scenes/HighScoresScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0b1a14",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, PlayScene, GameOverScene, HighScoresScene],
  input: {
    activePointers: 3,
  },
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
