import { NodeId, IdFactory } from "../value-objects/id.vo.js";
import { PortRange } from "../value-objects/port-range.vo.js";

export type NodeStatus = "ACTIVE" | "DISABLED";

export class Node {
  private constructor(
    private readonly id: NodeId,
    private readonly alias: string,
    private readonly ipAddress: string,
    private readonly memoryCapacityMb: number,
    private readonly portRange: PortRange,
    private status: NodeStatus,
    private readonly createdAt: Date
  ) {}

  public static create(
    alias: string,
    ipAddress: string,
    memoryCapacityMb: number,
    portRange: PortRange
  ): Node {
    if (memoryCapacityMb <= 0) throw new Error("Memory capacity must be greater than 0");
    return new Node(
      IdFactory.generate<NodeId>(),
      alias,
      ipAddress,
      memoryCapacityMb,
      portRange,
      "ACTIVE", // Estado inicial
      new Date() // Fecha de creación
    );
  }

  public static reconstitute(
    id: string,
    alias: string,
    ipAddress: string,
    memoryCapacityMb: number,
    portRangeStart: number,
    portRangeEnd: number,
    status: NodeStatus,
    createdAt: Date
  ): Node {
    const node = new Node(
      IdFactory.load<NodeId>(id),
      alias,
      ipAddress,
      memoryCapacityMb,
      PortRange.create(portRangeStart, portRangeEnd),
      status,
      createdAt
    );
    return node;
  }

  canAllocate(usedMemoryMb: number, requiredMemoryMb: number): boolean {
    if (this.status === "DISABLED") return false;
    return usedMemoryMb + requiredMemoryMb <= this.memoryCapacityMb;
  }

  getValidPort(usedPorts: number[]): number {
    const port = this.portRange.findAvailable(usedPorts);
    if (!port) throw new Error("No available ports in this node");
    return port;
  }

  disable(): void {
    if (this.status === "DISABLED") throw new Error("Node is already disabled");
    this.status = "DISABLED";
  }

  isDisabled(): boolean {
    return this.status === "DISABLED";
  }

  isActive(): boolean {
    return this.status === "ACTIVE";
  }

  // Getters
  getId(): NodeId {
    return this.id;
  }

  getAlias(): string {
    return this.alias;
  }

  getIpAddress(): string {
    return this.ipAddress;
  }
  getPortRange(): PortRange {
    return this.portRange;
  }

  getMemoryCapacityMb(): number {
    return this.memoryCapacityMb;
  }
}
