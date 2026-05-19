export class UserId {
  private constructor(readonly value: string) {}

  static generate(): UserId {
    const uuid = crypto.randomUUID();
    return new UserId(uuid);
  }

  static load(id: string): UserId {
    if (!UserId.isValid(id)) {
      throw new Error("Invalid UserId format");
    }
    return new UserId(id);
  }

  private static isValid(id: string): boolean {
    if (!id || id.trim().length === 0) return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  equals(other: UserId): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
