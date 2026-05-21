export type ServerStatus = "stopped" | "starting" | "running" | "stopping" | "error";
export type ServerType = "VANILLA" | "PAPER" | "FORGE" | "FABRIC";

import { ServerId, OwnerId, NodeId, TemplateId } from "../../shared/domain/value-objects/id.vo";
import { MemoryLimit } from "../value-objects/memory-limit.vo";
import { ServerConfiguration } from "../value-objects/server-configuration";

export class Server {
  constructor(
    private readonly id: ServerId,
    private readonly name: string,
    private readonly ownerId: OwnerId,
    private readonly nodeId: NodeId,
    private readonly templateId: TemplateId,
    private readonly memoryLimit: MemoryLimit,
    private diskLimitMb: number,
    private status: ServerStatus,
    private allocatedPort: number,
    private configuration: ServerConfiguration,
    private readonly createdAt: Date
  ) {}

  // Getters
  getId(): ServerId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getOwnerId(): OwnerId {
    return this.ownerId;
  }
}
