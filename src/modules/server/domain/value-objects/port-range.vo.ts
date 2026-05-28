export class PortRange {
  private constructor(
    public readonly start: number,
    public readonly end: number
  ) {}

  static create(start: number, end: number): PortRange {
    if (start < 1 || start > 65535) {
      throw new Error("Start port must be between 1 and 65535");
    }
    if (end < 1 || end > 65535) {
      throw new Error("End port must be between 1 and 65535");
    }
    if (start > end) {
      throw new Error("Start port must be less than or equal to end port");
    }
    return new PortRange(start, end);
  }

  findAvailable(usedPorts: number[]): number | null {
    for (let port = this.start; port <= this.end; port++) {
      if (!usedPorts.includes(port)) return port;
    }
    return null;
  }

  overlapsWith(other: PortRange): boolean {
    return this.start <= other.end && other.start <= this.end;
  }

  equals(other: PortRange): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.start === other.start && this.end === other.end;
  }

  getValue(): string {
    return `${this.start}-${this.end}`;
  }
}
