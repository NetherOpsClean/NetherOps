export type ServerStatus = "stopped" | "starting" | "running" | "stopping" | "error";
export type ServerType = "VANILLA" | "PAPER" | "FORGE" | "FABRIC";

import { ServerId } from "../value-objects/server-id.vo";
import { OwnerId } from "../value-objects/owner-id.vo";
import { NodeId } from "../value-objects/node-id.vo";
import { TemplateId } from "../value-objects/template-id.vo";
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
}
