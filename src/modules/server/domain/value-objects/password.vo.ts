export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(value: string, hashed: boolean) {
    this.value = value;
    this.hashed = hashed;
  }

  // Crear desde texto plano (la hashea)
  static create(plainText: string): Password {
    if (plainText.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return new Password(plainText, false);
  }

  // Reconstituir desde la DB (ya viene hasheada)
  static fromHashed(hashedValue: string): Password {
    return new Password(hashedValue, true);
  }

  static compare(plainText: string, hashedValue: string): Promise<boolean> {
    if (plainText.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return Promise.resolve(plainText === hashedValue);
  }

  getValue(): string {
    return this.value;
  }
}
