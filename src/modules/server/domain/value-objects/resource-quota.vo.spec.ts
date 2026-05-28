import { ResourceQuota } from "./resource-quota.vo.js";

describe("ResourceQuota Value Object", () => {
  describe("Creation and Validation", () => {
    it("should create a valid ResourceQuota with a positive integer", () => {
      const quota = ResourceQuota.create(4096);

      expect(quota.memoryMb).toBe(4096);
    });

    it("should throw an error if the memory quota is zero", () => {
      expect(() => ResourceQuota.create(0)).toThrow("Memory quota must be a positive integer");
    });

    it("should throw an error if the memory quota is a negative number", () => {
      expect(() => ResourceQuota.create(-512)).toThrow("Memory quota must be a positive integer");
    });
  });

  describe("Equality (equals)", () => {
    it("should return true when comparing two quotas with the same value", () => {
      const quota1 = ResourceQuota.create(2048);
      const quota2 = ResourceQuota.create(2048);

      expect(quota1.equals(quota2)).toBe(true);
    });

    it("should return false when comparing two quotas with different values", () => {
      const quota1 = ResourceQuota.create(2048);
      const quota2 = ResourceQuota.create(4096);

      expect(quota1.equals(quota2)).toBe(false);
    });

    it("should return false when comparing against null or undefined (ESLint safe)", () => {
      const quota = ResourceQuota.create(1024);

      expect(quota.equals(null as unknown as ResourceQuota)).toBe(false);
      expect(quota.equals(undefined as unknown as ResourceQuota)).toBe(false);
    });
  });

  describe("Utility Methods", () => {
    it("should return the formatted string correctly via getMemoryQuota()", () => {
      const quota = ResourceQuota.create(8192);

      expect(quota.getMemoryQuota()).toBe("8192 MB");
    });

    it("should return the raw numeric value via getValue()", () => {
      const quota = ResourceQuota.create(8192);

      expect(quota.getValue()).toBe(8192);
    });
  });
});
