import { DisableNodeUseCase } from "./disable-node.use-case.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { ServerRepository } from "../../domain/repositories/server.repository.js";
import { ContainerProvider } from "../ports/container.provider.js";
import { DeleteNodeDto } from "../dtos/delete-node.dto.js";
import { Node } from "../../domain/entities/node.entity.js";
import { Server } from "../../domain/entities/server.entity.js";
import { jest } from "@jest/globals";

describe("DisableNodeUseCase", () => {
  let mockNodeRepository: jest.Mocked<NodeRepository>;
  let mockServerRepository: jest.Mocked<ServerRepository>;
  let mockContainerProvider: jest.Mocked<ContainerProvider>;
  let useCase: DisableNodeUseCase;

  const validNodeId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    // 1. Mock del NodeRepository
    mockNodeRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<NodeRepository>;

    // 2. Mock del ServerRepository
    mockServerRepository = {
      findActiveByNodeId: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ServerRepository>;

    // 3. Mock del ContainerProvider
    mockContainerProvider = {
      stop: jest.fn(),
      // añade otros métodos de tu provider si TS lo exige (ej. start, remove)
    } as unknown as jest.Mocked<ContainerProvider>;

    useCase = new DisableNodeUseCase(
      mockNodeRepository,
      mockServerRepository,
      mockContainerProvider
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Error Scenarios", () => {
    it("should throw an error if the node is not found", async () => {
      const dto: DeleteNodeDto = { nodeId: validNodeId, requesterId: "some-user-id" };

      mockNodeRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow("Node not found");

      expect(mockNodeRepository.save).not.toHaveBeenCalled();
      expect(mockServerRepository.findActiveByNodeId).not.toHaveBeenCalled();
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();
    });
  });

  describe("Success Scenarios", () => {
    it("should disable the node, stop active servers, and stop their containers", async () => {
      const dto: DeleteNodeDto = { nodeId: validNodeId, requesterId: "some-user-id" };

      const mockNode = { disable: jest.fn() } as unknown as Node;

      const mockServer1 = {
        getId: () => "server-id-1",
        stop: jest.fn(),
      } as unknown as Server;
      const mockServer2 = {
        getId: () => "server-id-2",
        stop: jest.fn(),
      } as unknown as Server;

      mockNodeRepository.findById.mockResolvedValue(mockNode);
      mockServerRepository.findActiveByNodeId.mockResolvedValue([mockServer1, mockServer2]);

      await useCase.execute(dto);

      // Verificamos que el nodo se deshabilite y se guarde
      expect(mockNode.disable).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledWith(mockNode);

      // Verificamos los servidores (memoria y base de datos)
      expect(mockServerRepository.findActiveByNodeId).toHaveBeenCalledWith(validNodeId);
      expect(mockServer1.stop).toHaveBeenCalledTimes(1);
      expect(mockServer2.stop).toHaveBeenCalledTimes(1);

      // Verificamos la infraestructura (Docker containers apagados)
      expect(mockContainerProvider.stop).toHaveBeenCalledTimes(2);
      expect(mockContainerProvider.stop).toHaveBeenCalledWith("server-id-1");
      expect(mockContainerProvider.stop).toHaveBeenCalledWith("server-id-2");
    });

    it("should successfully disable the node even if there are no active servers", async () => {
      const dto: DeleteNodeDto = { nodeId: validNodeId, requesterId: "some-user-id" };

      const mockNode = { disable: jest.fn() } as unknown as Node;

      mockNodeRepository.findById.mockResolvedValue(mockNode);
      mockServerRepository.findActiveByNodeId.mockResolvedValue([]);

      await useCase.execute(dto);

      // El nodo se deshabilita y se guarda
      expect(mockNode.disable).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledWith(mockNode);

      // No se toca la BD de servidores ni Docker
      expect(mockServerRepository.save).not.toHaveBeenCalled();
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();
    });
  });
});
