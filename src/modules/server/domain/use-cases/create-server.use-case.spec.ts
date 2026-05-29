import { CreateServerUseCase } from "./create-server.use-case.js";
import { ServerRepository } from "../../domain/repositories/server.repository.js";
import { UserRepository } from "../../domain/repositories/user.repository.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { CreateServerDto } from "../dtos/create-server.dto.js";
import { User } from "../../domain/entities/user.entity.js";
import { Node } from "../../domain/entities/node.entity.js";
import { jest } from "@jest/globals";
import { TemplateRepository } from "../repositories/template.repository.js";
import { ContainerProvider } from "../ports/container.provider.js";
import { Template } from "@prisma/client";

describe("CreateServerUseCase", () => {
  let useCase: CreateServerUseCase;
  let serverRepository: jest.Mocked<ServerRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let nodeRepository: jest.Mocked<NodeRepository>;
  let templateRepository: jest.Mocked<TemplateRepository>;
  let containerProvider: jest.Mocked<ContainerProvider>;

  const validDto: CreateServerDto = {
    name: "Mi Servidor Survival",
    ownerId: "user-123",
    nodeId: "node-456",
    templateId: "temp-789",
    memoryLimitMb: 2048,
    configuration: {
      maxPlayers: 20,
      gameMode: "SURVIVAL",
      difficulty: "HARD",
      pvpEnabled: true,
      motd: "Bienvenido",
      cracked: false,
    },
  };

  beforeEach(() => {
    serverRepository = {
      save: jest.fn(),
      findActiveByNodeId: jest.fn(),
      sumAllocatedMemoryByNodeId: jest.fn(),
      findActivePortsByNodeId: jest.fn(),
    } as unknown as jest.Mocked<ServerRepository>;

    nodeRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<NodeRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    templateRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<TemplateRepository>;

    containerProvider = {
      create: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as jest.Mocked<ContainerProvider>;

    useCase = new CreateServerUseCase(
      serverRepository,
      userRepository,
      nodeRepository,
      templateRepository,
      containerProvider
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create and save a server successfully when resources are available", async () => {
      const mockNode = {
        isDisabled: jest.fn().mockReturnValue(false),
        canAllocate: jest.fn().mockReturnValue(true),
        getValidPort: jest.fn().mockReturnValue(25565),
      } as unknown as Node;

      nodeRepository.findById.mockResolvedValue(mockNode);

      const mockOwner = {
        getQuota: jest.fn().mockReturnValue({ getValue: () => 4096 }),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockOwner);

      serverRepository.sumAllocatedMemoryByNodeId.mockResolvedValue(0);
      serverRepository.findActivePortsByNodeId.mockResolvedValue([]);

      const mockTemplate = {
        softwareIdentifier: "itzg/minecraft-server",
      };
      templateRepository.findById.mockResolvedValue(mockTemplate as unknown as Template);

      containerProvider.create.mockResolvedValue("mocked-container-id-123");

      const result = await useCase.execute(validDto);

      expect(nodeRepository.findById).toHaveBeenCalledWith("node-456");
      expect(mockNode.canAllocate).toHaveBeenCalledWith(0, 2048);
      expect(serverRepository.save).toHaveBeenCalledTimes(1);

      const savedServer = serverRepository.save.mock.calls[0][0];
      expect(savedServer.getPort()).toBe(25565);

      expect(templateRepository.findById).toHaveBeenCalledWith("temp-789");
      expect(containerProvider.create).toHaveBeenCalled();
      expect(result).toBe("mocked-container-id-123");
    });

    it("should throw an error if the node does not exist", async () => {
      nodeRepository.findById.mockResolvedValue(null);

      const mockOwner = {
        getQuota: jest.fn().mockReturnValue({ getValue: () => 4096 }),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockOwner);

      await expect(useCase.execute(validDto)).rejects.toThrow("Node not available");
      expect(serverRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if the node is disabled", async () => {
      const mockNode = {
        isDisabled: jest.fn().mockReturnValue(true),
      } as unknown as Node;
      nodeRepository.findById.mockResolvedValue(mockNode);

      const mockOwner = {
        getQuota: jest.fn().mockReturnValue({ getValue: () => 4096 }),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockOwner);

      await expect(useCase.execute(validDto)).rejects.toThrow("Node not available");
      expect(serverRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if the node does not have enough memory", async () => {
      const mockNode = {
        isDisabled: jest.fn().mockReturnValue(false),
        canAllocate: jest.fn().mockReturnValue(false),
      } as unknown as Node;

      const mockOwner = {
        getQuota: jest.fn().mockReturnValue({ getValue: () => 4096 }),
      } as unknown as User;

      userRepository.findById.mockResolvedValue(mockOwner);

      nodeRepository.findById.mockResolvedValue(mockNode);

      serverRepository.sumAllocatedMemoryByNodeId.mockResolvedValue(8192);
      serverRepository.findActivePortsByNodeId.mockResolvedValue([25565]);

      await expect(useCase.execute(validDto)).rejects.toThrow(
        "Node does not have enough resources to allocate this server"
      );

      expect(mockNode.canAllocate).toHaveBeenCalledWith(8192, 2048);
      expect(serverRepository.save).not.toHaveBeenCalled();
    });
  });
});
