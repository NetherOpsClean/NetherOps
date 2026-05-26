import { CreateServerDto } from "../dtos/create-server.dto.js";
import {
  type ServerRepository,
  SERVER_REPOSITORY,
} from "../../domain/repositories/server.repository.js";
//import { type UserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository.js";
import { type NodeRepository, NODE_REPOSITORY } from "../../domain/repositories/node.repository.js";

import { ServerConfiguration } from "../../domain/value-objects/server-configuration.vo.js";
import { Server } from "../../domain/entities/server.entity.js";
import { IdFactory, NodeId, TemplateId, UserId } from "../value-objects/id.vo.js";
import { MemoryLimit } from "../../domain/value-objects/memory-limit.vo.js";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class CreateServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private serverRepository: ServerRepository,
    //@Inject(USER_REPOSITORY)
    //private userRepository: UserRepository,
    @Inject(NODE_REPOSITORY)
    private nodeRepository: NodeRepository
  ) {}

  async execute(req: CreateServerDto): Promise<void> {
    const memoryLimit = MemoryLimit.create(req.memoryLimitMb);

    const ownerId = IdFactory.load<UserId>(req.ownerId);
    //const owner = await this.userRepository.findById(ownerId);
    //if (!owner) {
    //throw new Error("Owner not found");
    //}

    // Check if the owner has enough quota for this server
    //if (memoryLimit.valueMb > owner.getQuota().getValue()) {
    //throw new Error("Owner does not have enough quota for this server");
    //}

    // Check if the node exists and has enough resources to allocate this server
    const nodeId = IdFactory.load<NodeId>(req.nodeId);
    const node = await this.nodeRepository.findById(nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    const activeServers = await this.serverRepository.findActiveByNodeId(nodeId);
    const usedMemory = activeServers.reduce(
      (total, server) => total + server.getMemoryLimit().valueMb,
      0
    );
    const usedDisk = activeServers.reduce((total, server) => total + server.getDiskLimitMb(), 0);
    const usedPorts = activeServers.map((s) => s.getPort());

    if (!node.canAllocate(usedMemory, usedDisk, memoryLimit.valueMb, req.diskLimitMb)) {
      throw new Error("Node does not have enough resources to allocate this server");
    }

    const port = node.getValidPort(usedPorts);
    // Create the server configuration value object
    const configuration = ServerConfiguration.create(
      req.configuration.maxPlayers,
      req.configuration.gameMode,
      req.configuration.difficulty,
      req.configuration.pvpEnabled,
      req.configuration.motd,
      req.configuration.cracked
    );

    // Create the server entity
    const newServer = Server.create(
      req.name,
      ownerId,
      nodeId,
      IdFactory.load<TemplateId>(req.templateId),
      memoryLimit,
      req.diskLimitMb,
      port,
      configuration
    );

    await this.serverRepository.save(newServer);
  }
}
