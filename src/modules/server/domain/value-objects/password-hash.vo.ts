export class PasswordHash {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid password hash format");
    }
    this.value = value;
  }

  private isValid(hash: string): boolean {
    if (!hash || hash.trim().length === 0) return false;

    const bcryptRegex = /^\$2[aby]\$.{56}$/;
    return bcryptRegex.test(hash);
  }

  equals(other: PasswordHash): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
