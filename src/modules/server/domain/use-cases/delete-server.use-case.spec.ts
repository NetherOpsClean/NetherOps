import { DeleteServerUseCase } from "./delete-server.use-case.js";
import { ServerRepository } from "../../domain/repositories/server.repository.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { UserRepository } from "../../domain/repositories/user.repository.js";
import { ContainerProvider } from "../../domain/ports/container.provider.js";
import { DeleteServerDto } from "../dtos/delete-server.dto.js";
import { Server } from "../../domain/entities/server.entity.js";
import { User } from "../../domain/entities/user.entity.js";
import { jest } from "@jest/globals";

describe("DeleteServerUseCase", () => {
  let mockServerRepository: jest.Mocked<ServerRepository>;
  let mockNodeRepository: jest.Mocked<NodeRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockContainerProvider: jest.Mocked<ContainerProvider>;

  let useCase: DeleteServerUseCase;

  const validServerId = "123e4567-e89b-12d3-a456-426614174000";
  const validOwnerId = "123e4567-e89b-12d3-a456-426614174001";
  const validAdminId = "123e4567-e89b-12d3-a456-426614174002";
  const validHackerId = "123e4567-e89b-12d3-a456-426614174003";

  beforeEach(() => {
    mockServerRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ServerRepository>;

    mockUserRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockNodeRepository = {} as unknown as jest.Mocked<NodeRepository>;

    mockContainerProvider = {
      stop: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ContainerProvider>;

    useCase = new DeleteServerUseCase(
      mockServerRepository,
      mockNodeRepository,
      mockContainerProvider,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Error Scenarios (Guards)", () => {
    it("should throw an error if the server is not found", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validOwnerId };

      mockServerRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(
        `Server with ID ${validServerId} not found`
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw an error if the requester is not found", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validOwnerId };

      mockServerRepository.findById.mockResolvedValue({
        getOwnerId: () => validOwnerId,
      } as unknown as Server);

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(
        `requester with ID ${validOwnerId} not found`
      );
    });

    it("should throw an error if the requester is neither the owner nor an admin", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validHackerId };

      const mockServer = { getOwnerId: () => validOwnerId } as unknown as Server;
      const mockUser = { isAdmin: () => false } as unknown as User;

      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Requester does not have permission to delete this server"
      );
    });
  });

  describe("Success Scenarios", () => {
    it("should delete a STOPPED server if requester is the owner", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validOwnerId };

      const mockServer = {
        getId: () => validServerId,
        getOwnerId: () => validOwnerId,
        getStatus: () => "STOPPED",
        stop: jest.fn(),
      } as unknown as Server;

      const mockUser = { isAdmin: () => false } as unknown as User;

      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await useCase.execute(dto);

      // Verificamos que no se intentó apagar un servidor ya apagado
      expect(mockServer.stop).not.toHaveBeenCalled();
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();

      // Verificamos que se llamó a la eliminación correcta
      expect(mockServerRepository.delete).toHaveBeenCalledWith(validServerId);
      expect(mockContainerProvider.remove).toHaveBeenCalledWith(validServerId);
    });

    it("should delete a server if requester is an admin (even if not owner)", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validAdminId };

      const mockServer = {
        getId: () => validServerId,
        getOwnerId: () => validOwnerId, // El dueño es otro
        getStatus: () => "STOPPED",
      } as unknown as Server;

      const mockUser = { isAdmin: () => true } as unknown as User; // PERO es admin

      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await useCase.execute(dto);

      expect(mockServerRepository.delete).toHaveBeenCalledWith(validServerId);
    });

    it("should STOP a RUNNING server before deleting it", async () => {
      const dto: DeleteServerDto = { serverId: validServerId, requesterId: validOwnerId };

      const mockServer = {
        getId: () => validServerId,
        getOwnerId: () => validOwnerId,
        getStatus: () => "RUNNING",
        stop: jest.fn(),
      } as unknown as Server;

      const mockUser = { isAdmin: () => false } as unknown as User;

      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await useCase.execute(dto);

      // Primero debió detener la entidad y el contenedor
      expect(mockServer.stop).toHaveBeenCalled();
      expect(mockContainerProvider.stop).toHaveBeenCalledWith(validServerId);

      // Luego debió eliminarlo
      expect(mockServerRepository.delete).toHaveBeenCalledWith(validServerId);
      expect(mockContainerProvider.remove).toHaveBeenCalledWith(validServerId);
    });
  });
});
