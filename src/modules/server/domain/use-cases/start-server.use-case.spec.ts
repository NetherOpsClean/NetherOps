import { Test, TestingModule } from "@nestjs/testing";
import { StartServerUseCase } from "./start-server.use-case.js";
import { SERVER_REPOSITORY, type ServerRepository } from "../repositories/server.repository.js";
import { CONTAINER_PROVIDER, type ContainerProvider } from "../ports/container.provider.js";
import { Server } from "../../domain/entities/server.entity.js";
import { InternalServerErrorException } from "@nestjs/common";
import { jest } from "@jest/globals";

describe("StartServerUseCase", () => {
  let useCase: StartServerUseCase;
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
      start: jest.fn(),
      markAsRunning: jest.fn(),
    } as unknown as Server;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartServerUseCase,
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

    useCase = module.get<StartServerUseCase>(StartServerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy Path", () => {
    it("should successfully start the server and save the RUNNING state", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      const dto = { serverId: "server-1", requesterId: "user-123" };

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockServerRepository.findById).toHaveBeenCalled();
      expect(mockServer.start).toHaveBeenCalled();
      expect(mockContainerProvider.start).toHaveBeenCalledWith("mc-server-1");
      expect(mockServer.markAsRunning).toHaveBeenCalled();
      expect(mockServerRepository.save).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("Compensation (Rollback)", () => {
    it("should stop the Docker container if the database fails to save", async () => {
      // Arrange
      mockServerRepository.findById.mockResolvedValue(mockServer);
      mockServerRepository.save.mockRejectedValue(new Error("Postgres is down"));
      const dto = { serverId: "server-1", requesterId: "user-123" };

      // Act
      await expect(useCase.execute(dto)).rejects.toThrow(InternalServerErrorException);

      // Assert
      expect(mockContainerProvider.start).toHaveBeenCalledWith("mc-server-1");
      expect(mockContainerProvider.stop).toHaveBeenCalledWith("mc-server-1");
    });
  });
});
