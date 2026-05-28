export type ServerStatus =
  | "CREATING"
  | "OFFLINE"
  | "STARTING"
  | "RUNNING"
  | "STOPPING"
  | "SUSPENDED"
  | "ERROR";
export type ServerType = "VANILLA" | "PAPER" | "FORGE" | "FABRIC";

import { ServerId, UserId, NodeId, TemplateId, IdFactory } from "../value-objects/id.vo.js";
import { MemoryLimit } from "../value-objects/memory-limit.vo.js";
import { ServerConfiguration } from "../value-objects/server-configuration.vo.js";

export class Server {
  private constructor(
    private readonly id: ServerId,
    private readonly name: string,
    private readonly ownerId: UserId,
    private readonly nodeId: NodeId,
    private readonly templateId: TemplateId,
    private memoryLimit: MemoryLimit,
    private status: ServerStatus,
    private allocatedPort: number,
    private configuration: ServerConfiguration,
    private readonly createdAt: Date
  ) {}

  public static create(
    name: string,
    ownerId: UserId,
    nodeId: NodeId,
    templateId: TemplateId,
    memoryLimit: MemoryLimit,
    port: number,
    configuration: ServerConfiguration
  ): Server {
    return new Server(
      IdFactory.generate<ServerId>(),
      name,
      ownerId,
      nodeId,
      templateId,
      memoryLimit,
      "OFFLINE",
      port,
      configuration,
      new Date()
    );
  }

  public static reconstitute(
    id: string,
    name: string,
    ownerId: UserId,
    nodeId: NodeId,
    templateId: TemplateId,
    memoryLimit: MemoryLimit,
    status: ServerStatus,
    allocatedPort: number,
    configuration: ServerConfiguration,
    createdAt: Date
  ): Server {
    const server = new Server(
      IdFactory.load<ServerId>(id),
      name,
      ownerId,
      nodeId,
      templateId,
      memoryLimit,
      status,
      allocatedPort,
      configuration,
      createdAt
    );
    return server;
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

  getTemplateId(): TemplateId {
    return this.templateId;
  }

  getName(): string {
    return this.name;
  }

  getMemoryLimit(): MemoryLimit {
    return this.memoryLimit;
  }

  getMemoryMb(): number {
    return this.memoryLimit.valueMb;
  }

  getPort(): number {
    return this.allocatedPort;
  }

  getConfiguration(): ServerConfiguration {
    return this.configuration;
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  // Status checkers
  isOffline(): boolean {
    return this.status === "OFFLINE";
  }

  isStarting(): boolean {
    return this.status === "STARTING";
  }

  isRunning(): boolean {
    return this.status === "RUNNING";
  }

  isStopping(): boolean {
    return this.status === "STOPPING";
  }

  isActive(): boolean {
    return this.status === "RUNNING" || this.status === "STARTING";
  }

  // Business logic methods
  start(): void {
    if (this.status === "RUNNING" || this.status === "STARTING")
      throw new Error("Server is already running or starting");
    if (this.status !== "OFFLINE") throw new Error("Cannot start server");
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
    if (this.getStatus() === "RUNNING" || this.getStatus() === "STARTING") {
      throw new Error("Cannot change memory limit while server is running");
    }
    this.memoryLimit = newLimit;
  }

  changeConfiguration(newConfig: ServerConfiguration): void {
    if (this.getStatus() === "RUNNING" || this.getStatus() === "STARTING") {
      throw new Error("Cannot change configuration while server is running");
    }
    this.configuration = newConfig;
  }

  assignPort(port: number): void {
    this.allocatedPort = port;
  }
}
