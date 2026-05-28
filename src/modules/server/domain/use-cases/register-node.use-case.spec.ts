import { RegisterNodeUseCase } from "./register-node.use-case.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { RegisterNodeDto } from "../dtos/register-node.dto.js";
import { Node } from "../../domain/entities/node.entity.js";
import { PortRange } from "../../domain/value-objects/port-range.vo.js";
import { jest } from "@jest/globals";

describe("RegisterNodeUseCase", () => {
  let mockNodeRepository: jest.Mocked<NodeRepository>;
  let useCase: RegisterNodeUseCase;

  beforeEach(() => {
    mockNodeRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<NodeRepository>;

    useCase = new RegisterNodeUseCase(mockNodeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation Errors", () => {
    it("should throw an error if a node with the exact same IP address already exists", async () => {
      const dto: RegisterNodeDto = {
        alias: "new-node",
        ipAddress: "192.168.1.100",
        memoryCapacityMb: 8192,
        portRangeStart: 25565,
        portRangeEnd: 25575,
      };

      // Simulamos que ya existe un nodo en la BD con esa IP
      const mockExistingNode = {
        getIpAddress: () => "192.168.1.100",
        getPortRange: () => PortRange.create(20000, 20010), // Puertos diferentes, no importa
      } as unknown as Node;

      mockNodeRepository.findAll.mockResolvedValue([mockExistingNode]);

      await expect(useCase.execute(dto)).rejects.toThrow(
        "A node with this IP address already exists"
      );
      expect(mockNodeRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if the new port range overlaps with an existing node", async () => {
      const dto: RegisterNodeDto = {
        alias: "new-node",
        ipAddress: "192.168.1.101", // IP diferente, esto está bien
        memoryCapacityMb: 8192,
        portRangeStart: 25565,
        portRangeEnd: 25575,
      };

      // Simulamos un nodo con IP diferente pero un rango de puertos que choca (25570 está en medio)
      const mockExistingNode = {
        getIpAddress: () => "192.168.1.50",
        getPortRange: () => PortRange.create(25570, 25580),
      } as unknown as Node;

      mockNodeRepository.findAll.mockResolvedValue([mockExistingNode]);

      await expect(useCase.execute(dto)).rejects.toThrow(
        "The port range overlaps with an existing node"
      );
      expect(mockNodeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Success Scenario", () => {
    it("should create and save a new node successfully if IP and ports are unique", async () => {
      const dto: RegisterNodeDto = {
        alias: "success-node",
        ipAddress: "192.168.1.200",
        memoryCapacityMb: 16384,
        portRangeStart: 25565,
        portRangeEnd: 25575,
      };

      // Simulamos un nodo existente que no choca ni en IP ni en puertos
      const mockExistingNode = {
        getIpAddress: () => "192.168.1.50",
        getPortRange: () => PortRange.create(30000, 30010),
      } as unknown as Node;

      mockNodeRepository.findAll.mockResolvedValue([mockExistingNode]);

      const result = await useCase.execute(dto);

      expect(mockNodeRepository.save).toHaveBeenCalledTimes(1);

      expect(result).toBeInstanceOf(Node);
      expect(result.getAlias()).toBe("success-node");
      expect(result.getIpAddress()).toBe("192.168.1.200");
    });
  });
});
