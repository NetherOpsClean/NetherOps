export class Password {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(hash: string): Password {
    if (!hash || hash.trim().length === 0) {
      throw new Error("Password hash cannot be empty");
    }
    if (!this.prototype.isValid(hash)) {
      throw new Error("Invalid password hash format");
    }
    return new Password(hash);
  }

  private isValid(hash: string): boolean {
    if (!hash || hash.trim().length === 0) return false;

    const bcryptRegex = /^\$2[aby]\$.{56}$/;
    return bcryptRegex.test(hash);
  }

  equals(other: Password): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
