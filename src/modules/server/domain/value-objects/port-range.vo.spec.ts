import { PortRange } from "./port-range.vo.js";

describe("PortRange Value Object", () => {
  describe("Creation and Validation", () => {
    it("should create a valid PortRange when start and end are within limits", () => {
      const range = PortRange.create(25565, 25575);
      expect(range.start).toBe(25565);
      expect(range.end).toBe(25575);
    });

    it("should allow a range of a single port (start equals end)", () => {
      const range = PortRange.create(8080, 8080);
      expect(range.start).toBe(8080);
      expect(range.end).toBe(8080);
    });

    it("should throw an error if the start port is less than 1", () => {
      expect(() => PortRange.create(0, 8080)).toThrow("Start port must be between 1 and 65535");
    });

    it("should throw an error if the start port is greater than 65535", () => {
      expect(() => PortRange.create(65536, 66000)).toThrow(
        "Start port must be between 1 and 65535"
      );
    });

    it("should throw an error if the end port is less than 1", () => {
      expect(() => PortRange.create(8080, 0)).toThrow("End port must be between 1 and 65535");
    });

    it("should throw an error if the end port is greater than 65535", () => {
      expect(() => PortRange.create(8080, 65536)).toThrow("End port must be between 1 and 65535");
    });

    it("should throw an error if the start port is greater than the end port", () => {
      expect(() => PortRange.create(8080, 8000)).toThrow(
        "Start port must be less than or equal to end port"
      );
    });

    it("should throw an error if start or end are not integers", () => {
      expect(() => PortRange.create(8080.5, 8090)).toThrow("Start port must be a positive integer");
      expect(() => PortRange.create(8080, 8090.5)).toThrow("End port must be a positive integer");
    });

    it("should throw an error if start or end are not numbers", () => {
      expect(() => PortRange.create("8080" as unknown as number, 8090)).toThrow(
        "Start port must be a positive integer"
      );
      expect(() => PortRange.create(8080, "8090" as unknown as number)).toThrow(
        "End port must be a positive integer"
      );
    });
  });

  describe("Finding Available Ports (findAvailable)", () => {
    it("should return the first port in the range if no ports are used", () => {
      const range = PortRange.create(25565, 25575);
      expect(range.findAvailable([])).toBe(25565);
    });

    it("should return the next available port if the first ones are used", () => {
      const range = PortRange.create(25565, 25568);
      const usedPorts = [25565, 25567];
      expect(range.findAvailable(usedPorts)).toBe(25566);
    });

    it("should return null if all ports in the range are used", () => {
      const range = PortRange.create(25565, 25566);
      const usedPorts = [25565, 25566]; // Rango lleno
      expect(range.findAvailable(usedPorts)).toBeNull();
    });

    it("should ignore used ports that are outside of its own range", () => {
      const range = PortRange.create(25565, 25566);
      const usedPorts = [8080, 9000]; // Puertos ajenos a este rango
      expect(range.findAvailable(usedPorts)).toBe(25565);
    });
  });

  describe("Overlapping Logic (overlapsWith)", () => {
    const range = PortRange.create(1000, 2000);

    it("should return true if ranges overlap at the beginning", () => {
      const other = PortRange.create(500, 1500);
      expect(range.overlapsWith(other)).toBe(true);
    });

    it("should return true if ranges overlap at the end", () => {
      const other = PortRange.create(1500, 2500);
      expect(range.overlapsWith(other)).toBe(true);
    });

    it("should return true if the other range is completely inside this range", () => {
      const other = PortRange.create(1200, 1800);
      expect(range.overlapsWith(other)).toBe(true);
    });

    it("should return true if this range is completely inside the other range", () => {
      const other = PortRange.create(500, 2500);
      expect(range.overlapsWith(other)).toBe(true);
    });

    it("should return false if the other range is completely before this range", () => {
      const other = PortRange.create(500, 999);
      expect(range.overlapsWith(other)).toBe(false);
    });

    it("should return false if the other range is completely after this range", () => {
      const other = PortRange.create(2001, 2500);
      expect(range.overlapsWith(other)).toBe(false);
    });
  });

  describe("Equality (equals)", () => {
    it("should return true when comparing two PortRanges with identical start and end", () => {
      const range1 = PortRange.create(25565, 25575);
      const range2 = PortRange.create(25565, 25575);
      expect(range1.equals(range2)).toBe(true);
    });

    it("should return false when comparing ranges with different starts", () => {
      const range1 = PortRange.create(25565, 25575);
      const range2 = PortRange.create(25566, 25575);
      expect(range1.equals(range2)).toBe(false);
    });

    it("should return false when comparing ranges with different ends", () => {
      const range1 = PortRange.create(25565, 25575);
      const range2 = PortRange.create(25565, 25580);
      expect(range1.equals(range2)).toBe(false);
    });

    it("should return false when comparing against null or undefined (ESLint safe)", () => {
      const range = PortRange.create(25565, 25575);
      expect(range.equals(null as unknown as PortRange)).toBe(false);
      expect(range.equals(undefined as unknown as PortRange)).toBe(false);
    });
  });

  describe("Formatting", () => {
    it("should format the range as a string 'start-end'", () => {
      const range = PortRange.create(25565, 25575);
      expect(range.getValue()).toBe("25565-25575");
    });
  });
});
