import { MemoryLimit } from "./memory-limit.vo.js";

describe("MemoryLimit Value Object", () => {
  describe("Creation and Validation", () => {
    it("should create a MemoryLimit instance with a valid positive integer", () => {
      const memory = MemoryLimit.create(2048);
      expect(memory.valueMb).toBe(2048);
    });

    it("should throw an error if the value is zero", () => {
      expect(() => MemoryLimit.create(0)).toThrow("Memory limit must be a positive integer");
    });

    it("should throw an error if the value is a negative number", () => {
      expect(() => MemoryLimit.create(-1024)).toThrow("Memory limit must be a positive integer");
    });

    it("should throw an error if the value is not a number", () => {
      expect(() => MemoryLimit.create("not-a-number" as unknown as number)).toThrow(
        "Memory limit must be a positive integer"
      );
    });
  });

  describe("Equality (equals)", () => {
    it("should return true when comparing two MemoryLimits with the same value", () => {
      const memory1 = MemoryLimit.create(1024);
      const memory2 = MemoryLimit.create(1024);
      expect(memory1.equals(memory2)).toBe(true);
    });

    it("should return false when comparing two MemoryLimits with different values", () => {
      const memory1 = MemoryLimit.create(1024);
      const memory2 = MemoryLimit.create(2048);
      expect(memory1.equals(memory2)).toBe(false);
    });

    it("should return false when comparing against null or undefined", () => {
      const memory = MemoryLimit.create(1024);
      expect(memory.equals(null as unknown as MemoryLimit)).toBe(false);
      expect(memory.equals(undefined as unknown as MemoryLimit)).toBe(false);
    });
  });

  describe("Formatting", () => {
    it("should return the formatted string correctly via getValue()", () => {
      const memory = MemoryLimit.create(4096);

      expect(memory.getValue()).toBe("4096 MB");
    });
  });
});
