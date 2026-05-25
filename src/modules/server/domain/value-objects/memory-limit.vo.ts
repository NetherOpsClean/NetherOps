export class MemoryLimit {
  readonly valueMb: number;

  private constructor(valueMb: number) {
    this.valueMb = valueMb;
  }

  static create(valueMb: number): MemoryLimit {
    if (valueMb <= 0) {
      throw new Error("Memory limit must be a positive integer");
    }
    return new MemoryLimit(valueMb);
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
