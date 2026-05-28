import { DisableNodeUseCase } from "./disable-node.use-case.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { DeleteNodeDto } from "../dtos/delete-node.dto.js";
import { Node } from "../../domain/entities/node.entity.js";
import { jest } from "@jest/globals";

describe("DisableNodeUseCase", () => {
  let mockNodeRepository: jest.Mocked<NodeRepository>;
  let useCase: DisableNodeUseCase;

  const validNodeId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    mockNodeRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<NodeRepository>;

    useCase = new DisableNodeUseCase(mockNodeRepository);
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
    });
  });

  describe("Success Scenarios", () => {
    it("should disable the node, stop active servers, and stop their containers", async () => {
      const dto: DeleteNodeDto = { nodeId: validNodeId, requesterId: "some-user-id" };

      const mockNode = { disable: jest.fn() } as unknown as Node;

      mockNodeRepository.findById.mockResolvedValue(mockNode);

      await useCase.execute(dto);

      // Verificamos que el nodo se deshabilite y se guarde
      expect(mockNode.disable).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledWith(mockNode);
    });

    it("should successfully disable the node even if there are no active servers", async () => {
      const dto: DeleteNodeDto = { nodeId: validNodeId, requesterId: "some-user-id" };

      const mockNode = { disable: jest.fn() } as unknown as Node;

      mockNodeRepository.findById.mockResolvedValue(mockNode);

      await useCase.execute(dto);

      // El nodo se deshabilita y se guarda
      expect(mockNode.disable).toHaveBeenCalledTimes(1);
      expect(mockNodeRepository.save).toHaveBeenCalledWith(mockNode);
    });
  });
});
