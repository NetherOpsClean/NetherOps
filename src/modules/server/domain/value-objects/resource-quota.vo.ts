export class ResourceQuota {
  readonly memoryMb: number;

  private constructor(memoryMb: number) {
    this.memoryMb = memoryMb;
  }

  static create(memoryMb: number): ResourceQuota {
    if (memoryMb <= 0) {
      throw new Error("Memory quota must be a positive integer");
    }
    return new ResourceQuota(memoryMb);
  }

  equals(other: ResourceQuota): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.memoryMb === other.memoryMb;
  }

  getMemoryQuota(): string {
    return `${this.memoryMb} MB`;
  }

  getValue(): number {
    return this.memoryMb;
  }
}
