import { FORMS, FORM_ORDER, type FormId, type FormStats } from "./types";

/** Phase 0: cycle forms as stand-in for artifact-slot skills. */
export class FormRegistry {
  private index = 0;

  get current(): FormStats {
    return FORMS[FORM_ORDER[this.index]!];
  }

  get currentId(): FormId {
    return this.current.id;
  }

  cycle(): FormStats {
    this.index = (this.index + 1) % FORM_ORDER.length;
    return this.current;
  }

  set(id: FormId): FormStats {
    const idx = FORM_ORDER.indexOf(id);
    if (idx >= 0) this.index = idx;
    return this.current;
  }

  reset(): void {
    this.index = 0;
  }
}
