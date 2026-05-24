export type ServerStatus =
  | "CREATING"
  | "OFFLINE"
  | "STARTING"
  | "RUNNING"
  | "STOPPING"
  | "SUSPENDED"
  | "ERROR";
export type ServerType = "VANILLA" | "PAPER" | "FORGE" | "FABRIC";

import {
  ServerId,
  UserId,
  NodeId,
  TemplateId,
  IdFactory,
} from "../../shared/domain/value-objects/id.vo";
import { MemoryLimit } from "../value-objects/memory-limit.vo";
import { ServerConfiguration } from "../value-objects/server-configuration";

export class Server {
  private readonly id: ServerId;

  private constructor(
    private readonly name: string,
    private readonly ownerId: UserId,
    private readonly nodeId: NodeId,
    private readonly templateId: TemplateId,
    private memoryLimit: MemoryLimit,
    private diskLimitMb: number,
    private status: ServerStatus,
    private allocatedPort: number,
    private configuration: ServerConfiguration,
    private readonly createdAt: Date
  ) {
    this.id = IdFactory.generate<ServerId>(); // Genera un nuevo ID para el servidor
  }

  public static create(
    name: string,
    ownerId: UserId,
    nodeId: NodeId,
    templateId: TemplateId,
    memoryLimit: MemoryLimit,
    diskLimitMb: number,
    port: number,
    configuration: ServerConfiguration
  ): Server {
    return new Server(
      name,
      ownerId,
      nodeId,
      templateId,
      memoryLimit,
      diskLimitMb,
      "OFFLINE", // Estado inicial
      port,
      configuration,
      new Date() // Fecha de creación
    );
  }

  // Getters
  getId(): ServerId {
    return this.id;
  }

  getOwnerId(): UserId {
    return this.ownerId;
  }

  getNodeId(): NodeId {
    return this.nodeId;
  }

  getMemoryLimit(): MemoryLimit {
    return this.memoryLimit;
  }

  getDiskLimitMb(): number {
    return this.diskLimitMb;
  }

  getMemoryMb(): number {
    return this.memoryLimit.valueMb;
  }

  getPort(): number {
    return this.allocatedPort;
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  // Business logic methods
  start(): void {
    if (this.status === "RUNNING" || this.status === "STARTING")
      throw new Error("Server is already running or starting");
    this.status = "STARTING";
  }

  markAsRunning(): void {
    if (this.status !== "STARTING") throw new Error("Server must be STARTING to mark as running");
    this.status = "RUNNING";
  }

  stop(): void {
    if (this.status === "OFFLINE" || this.status === "STOPPING" || this.status === "SUSPENDED")
      throw new Error("Server is already out of service");
    this.status = "STOPPING";
  }

  markAsOffline(): void {
    if (this.status !== "STOPPING") throw new Error("Server must be STOPPING to mark as offline");
    this.status = "OFFLINE";
  }

  markAsSuspended(): void {
    this.status = "SUSPENDED";
  }

  markAsError(): void {
    this.status = "ERROR";
  }

  changeMemoryLimit(newLimit: MemoryLimit): void {
    if (this.getStatus() === "RUNNING") {
      throw new Error("Cannot change memory limit while server is running");
    }
    this.memoryLimit = newLimit;
  }

  changeConfiguration(newConfig: ServerConfiguration): void {
    if (this.getStatus() === "RUNNING") {
      throw new Error("Cannot change configuration while server is running");
    }
    this.configuration = newConfig;
  }

  assignPort(port: number): void {
    this.allocatedPort = port;
  }
}
