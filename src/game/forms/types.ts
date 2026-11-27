export type FormId = "human" | "cheetah" | "frog";

export interface FormStats {
  id: FormId;
  label: string;
  /** Horizontal move multiplier */
  speed: number;
  /** Jump impulse (negative Y) */
  jumpVelocity: number;
  /**
   * Extra mid-air jumps after leaving the ground.
   * 0 = single jump (Human); 1 = double jump (Cheetah / Frog).
   */
  airJumps: number;
  /** Tint for placeholder sprite */
  color: number;
  /** Short skill hint for HUD */
  skillHint: string;
}

export const FORMS: Record<FormId, FormStats> = {
  human: {
    id: "human",
    label: "Human",
    speed: 1,
    jumpVelocity: -520,
    airJumps: 0,
    color: 0xe8c39e,
    skillHint: "Jump",
  },
  cheetah: {
    id: "cheetah",
    label: "Cheetah",
    speed: 1.45,
    jumpVelocity: -580,
    airJumps: 1,
    color: 0xf0a030,
    skillHint: "Long fast double jump",
  },
  frog: {
    id: "frog",
    label: "Frog",
    speed: 0.75,
    jumpVelocity: -720,
    airJumps: 1,
    color: 0x5ecf6a,
    skillHint: "Long high double jump",
  },
};

export const FORM_ORDER: FormId[] = ["human", "cheetah", "frog"];
