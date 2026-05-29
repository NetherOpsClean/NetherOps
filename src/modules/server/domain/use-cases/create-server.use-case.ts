import { CreateServerDto } from "../dtos/create-server.dto.js";
import { Difficulty, GameMode } from "../../domain/value-objects/configuration.enum.js";
import {
  type ServerRepository,
  SERVER_REPOSITORY,
} from "../../domain/repositories/server.repository.js";
import { type UserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository.js";
import { type NodeRepository, NODE_REPOSITORY } from "../../domain/repositories/node.repository.js";

import { ServerConfiguration } from "../../domain/value-objects/server-configuration.vo.js";
import { Server } from "../../domain/entities/server.entity.js";
import { IdFactory, NodeId, TemplateId, UserId } from "../value-objects/id.vo.js";
import { MemoryLimit } from "../../domain/value-objects/memory-limit.vo.js";
import { Injectable, Inject } from "@nestjs/common";
import {
  TEMPLATE_REPOSITORY,
  type TemplateRepository,
} from "../repositories/template.repository.js";
import { CONTAINER_PROVIDER, type ContainerProvider } from "../ports/container.provider.js";

@Injectable()
export class CreateServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private serverRepository: ServerRepository,
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository,
    @Inject(NODE_REPOSITORY)
    private nodeRepository: NodeRepository,
    @Inject(TEMPLATE_REPOSITORY)
    private templateRepository: TemplateRepository,
    @Inject(CONTAINER_PROVIDER)
    private containerService: ContainerProvider
  ) {}

  async execute(req: CreateServerDto): Promise<string> {
    const memoryLimit = MemoryLimit.create(req.memoryLimitMb);

    const ownerId = IdFactory.load<UserId>(req.ownerId);
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new Error("Owner not found");
    }

    // Check if the owner has enough quota for this server
    if (memoryLimit.valueMb > owner.getQuota().getValue()) {
      throw new Error("Owner does not have enough quota for this server");
    }

    // Check if the node exists and has enough resources to allocate this server
    const nodeId = IdFactory.load<NodeId>(req.nodeId);
    const node = await this.nodeRepository.findById(nodeId);
    if (!node || node.isDisabled()) {
      throw new Error("Node not available");
    }
    const usedMemory = await this.serverRepository.sumAllocatedMemoryByNodeId(nodeId);
    const usedPorts = await this.serverRepository.findActivePortsByNodeId(nodeId);

    if (!node.canAllocate(usedMemory, memoryLimit.valueMb)) {
      throw new Error("Node does not have enough resources to allocate this server");
    }

    const port = node.getValidPort(usedPorts);

    const templateId = IdFactory.load<TemplateId>(req.templateId);
    const template = await this.templateRepository.findById(templateId);
    if (!template) throw new Error("Template not found");

    if (Object.values(GameMode).indexOf(req.configuration.gameMode as GameMode) === -1) {
      throw new Error(`Invalid game mode: ${req.configuration.gameMode}`);
    }

    if (Object.values(Difficulty).indexOf(req.configuration.difficulty as Difficulty) === -1) {
      throw new Error(`Invalid difficulty: ${req.configuration.difficulty}`);
    }

    const gameMode = GameMode[req.configuration.gameMode as keyof typeof GameMode];
    const dificulty = Difficulty[req.configuration.difficulty as keyof typeof Difficulty];

    const configuration = ServerConfiguration.create(
      req.configuration.maxPlayers,
      gameMode,
      dificulty,
      req.configuration.pvpEnabled,
      req.configuration.motd,
      req.configuration.cracked
    );

    const newServer = Server.create(
      req.name,
      ownerId,
      nodeId,
      templateId,
      memoryLimit,
      port,
      configuration
    );

    await this.serverRepository.save(newServer);

    return await this.containerService.create({
      serverId: newServer.getId(),
      name: newServer.getName(),
      memoryMb: memoryLimit.valueMb,
      port: port,
      image: template.softwareIdentifier,
      gameMode: req.configuration.gameMode,
      difficulty: req.configuration.difficulty,
      motd: req.configuration.motd,
      maxPlayers: req.configuration.maxPlayers,
      pvpEnabled: req.configuration.pvpEnabled,
      cracked: req.configuration.cracked,
    });
  }
}
