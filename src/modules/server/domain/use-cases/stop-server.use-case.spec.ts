import { Test, TestingModule } from "@nestjs/testing";
import { StopServerUseCase } from "./stop-server.use-case.js";
import {
  SERVER_REPOSITORY,
  type ServerRepository,
} from "../../domain/repositories/server.repository.js";
import {
  CONTAINER_PROVIDER,
  type ContainerProvider,
} from "../../domain/ports/container.provider.js";
import { Server } from "../../domain/entities/server.entity.js";
import {
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { StopServerDto } from "../../domain/dtos/stop-server.dto.js";
import { jest } from "@jest/globals";

describe("StopServerUseCase", () => {
  let useCase: StopServerUseCase;
  let mockServerRepository: jest.Mocked<ServerRepository>;
  let mockContainerProvider: jest.Mocked<ContainerProvider>;
  let mockServer: Server;

  beforeEach(async () => {
    mockServerRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ServerRepository>;

    mockContainerProvider = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as jest.Mocked<ContainerProvider>;

    mockServer = {
      getOwnerId: jest.fn().mockReturnValue("user-123"),
      stop: jest.fn(),
      markAsOffline: jest.fn(),
    } as unknown as Server;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StopServerUseCase,
        {
          provide: SERVER_REPOSITORY,
          useValue: mockServerRepository,
        },
        {
          provide: CONTAINER_PROVIDER,
          useValue: mockContainerProvider,
        },
      ],
    }).compile();

    useCase = module.get<StopServerUseCase>(StopServerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy Path", () => {
    it("should successfully stop the server, call docker stop, and save OFFLINE state", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      const dto = new StopServerDto("server-1", "user-123");

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockServerRepository.findById).toHaveBeenCalled();
      expect(mockServer.stop).toHaveBeenCalled();
      expect(mockContainerProvider.stop).toHaveBeenCalledWith("mc-server-1");
      expect(mockServer.markAsOffline).toHaveBeenCalled();
      expect(mockServerRepository.save).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("Validation Errors", () => {
    it("should throw NotFoundException if the server does not exist", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(null);
      const dto = new StopServerDto("server-1", "user-123");

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if requester is not the server owner", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      const dto = new StopServerDto("server-1", "hacker-999");

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockServer.stop).not.toHaveBeenCalled();
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();
    });

    it("should throw ConflictException if domain logic prevents stopping (e.g. already offline)", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      const dto = new StopServerDto("server-1", "user-123");

      (mockServer.stop as jest.Mock).mockImplementation(() => {
        throw new Error("Server is already out of service");
      });

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockContainerProvider.stop).not.toHaveBeenCalled();
    });
  });

  describe("Infrastructure Errors", () => {
    it("should throw InternalServerErrorException if database fails to save the OFFLINE state", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockServerRepository.save.mockRejectedValue(new Error("Database disconnected"));
      const dto = new StopServerDto("server-1", "user-123");

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(InternalServerErrorException);

      expect(mockContainerProvider.stop).toHaveBeenCalledWith("mc-server-1");
    });
  });
});
