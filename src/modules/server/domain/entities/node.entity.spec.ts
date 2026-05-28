import { Node } from "./node.entity.js";
import { PortRange } from "../value-objects/port-range.vo.js";

const makeNode = (
  overrides?: Partial<{
    alias: string;
    ipAddress: string;
    memoryCapacityMb: number;
    portRangeStart: number;
    portRangeEnd: number;
    totalDiskMb: number;
  }>
): Node => {
  return Node.create(
    overrides?.alias ?? "test-node",
    overrides?.ipAddress ?? "127.0.0.1",
    overrides?.memoryCapacityMb ?? 8192,
    PortRange.create(overrides?.portRangeStart ?? 25565, overrides?.portRangeEnd ?? 25575)
  );
};

describe("Node Entity", () => {
  describe("Creation and State", () => {
    it("should create a node with ACTIVE status", () => {
      const node = makeNode();
      expect(node.isActive()).toBe(true);
    });

    it("should successfully disable an active node", () => {
      const node = makeNode();
      node.disable();
      expect(node.isDisabled()).toBe(true);
    });

    it("should throw an error if trying to disable an already disabled node", () => {
      const node = makeNode();
      node.disable();
      expect(() => node.disable()).toThrow("Node is already disabled");
    });

    it("should generate a unique id", () => {
      const a = makeNode();
      const b = makeNode();
      expect(a.getId().toString()).not.toBe(b.getId().toString());
    });

    it("should store the provided memory capacity", () => {
      const node = makeNode({ memoryCapacityMb: 16384 });
      expect(node.getMemoryCapacityMb()).toBe(16384);
    });

    it("shouldnt allow creating a node with non-positive memory capacity", () => {
      expect(() => makeNode({ memoryCapacityMb: 0 })).toThrow(
        "Memory capacity must be greater than 0"
      );
      expect(() => makeNode({ memoryCapacityMb: -1024 })).toThrow(
        "Memory capacity must be greater than 0"
      );
    });
  });

  describe("Resource Allocation (canAllocate)", () => {
    it("should return true when there is enough memory available", () => {
      const node = makeNode({ memoryCapacityMb: 1000 });
      const usedMemory = 500;
      const requiredMemory = 500;

      expect(node.canAllocate(usedMemory, requiredMemory)).toBe(true);
    });

    it("should return false when requested memory exceeds capacity", () => {
      const node = makeNode({ memoryCapacityMb: 1000 });
      const usedMemory = 800;
      const requiredMemory = 300;
      expect(node.canAllocate(usedMemory, requiredMemory)).toBe(false);
    });

    it("should always return false if the node is DISABLED, regardless of resources", () => {
      const node = makeNode({ memoryCapacityMb: 99999 });
      node.disable();
      expect(node.canAllocate(0, 100)).toBe(false);
    });
  });

  describe("Port Management", () => {
    it("should return an available port within its range", () => {
      const node = makeNode({ portRangeStart: 25565, portRangeEnd: 25567 });
      const usedPorts = [25565];
      const validPort = node.getValidPort(usedPorts);
      expect(validPort).toBe(25566);
    });

    it("should throw an error if no ports are available in the node", () => {
      const node = makeNode({ portRangeStart: 25565, portRangeEnd: 25567 });
      const usedPorts = [25565, 25566, 25567];
      expect(() => node.getValidPort(usedPorts)).toThrow("No available ports in this node");
    });
  });
});
