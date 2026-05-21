export class MemoryLimit {
  readonly valueMb: number;

  constructor(valueMb: number) {
    if (valueMb <= 0) {
      throw new Error("Memory limit must be a positive integer");
    }
    this.valueMb = valueMb;
  }

  equals(other: MemoryLimit): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.valueMb === other.valueMb;
  }

  getValue(): string {
    return `${this.valueMb} MB`;
  }
}
