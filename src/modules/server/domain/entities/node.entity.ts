import { NodeId, IdFactory } from "../../shared/domain/value-objects/id.vo";
import { PortRange } from "../value-objects/port-range.vo";

export type NodeStatus = "ACTIVE" | "DISABLED";

export class Node {
  private readonly id: NodeId;
  private readonly createdAt: Date;
  private status: NodeStatus;

  private constructor(
    private readonly alias: string,
    private readonly ipAddress: string,
    private readonly memoryCapacityMb: number,
    private readonly portRange: PortRange,
    private readonly totalDiskMb: number
  ) {
    this.id = IdFactory.generate<NodeId>();
    this.createdAt = new Date();
    this.status = "ACTIVE";
  }

  public static create(
    alias: string,
    ipAddress: string,
    memoryCapacityMb: number,
    portRange: PortRange,
    totalDiskMb: number
  ): Node {
    return new Node(alias, ipAddress, memoryCapacityMb, portRange, totalDiskMb);
  }

  canAllocate(
    usedMemoryMb: number,
    usedDiskMb: number,
    requiredMemoryMb: number,
    requiredDiskMb: number
  ): boolean {
    if (this.status === "DISABLED") return false;
    return (
      usedMemoryMb + requiredMemoryMb <= this.memoryCapacityMb &&
      usedDiskMb + requiredDiskMb <= this.totalDiskMb
    );
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

  getId(): NodeId {
    return this.id;
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
  getTotalDiskMb(): number {
    return this.totalDiskMb;
  }
}
