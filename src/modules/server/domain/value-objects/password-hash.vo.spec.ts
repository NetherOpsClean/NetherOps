import { Password } from "./password-hash.vo.js";

const VALID_HASH = "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO";

describe("Password Value Object", () => {
  describe("create()", () => {
    it("should create a password with a valid bcrypt hash", () => {
      const password = Password.create(VALID_HASH);
      expect(password.value).toBe(VALID_HASH);
    });

    it("should accept $2b$ prefix", () => {
      const hash = "$2b$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO";
      const password = Password.create(hash);
      expect(password.value).toBe(hash);
    });

    it("should accept $2y$ prefix", () => {
      const hash = "$2y$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO";
      const password = Password.create(hash);
      expect(password.value).toBe(hash);
    });

    it("should throw if hash is empty", () => {
      expect(() => Password.create("")).toThrow("Password hash cannot be empty");
    });

    it("should throw if hash is only whitespace", () => {
      expect(() => Password.create("   ")).toThrow("Password hash cannot be empty");
    });

    it("should throw if hash is plain text", () => {
      expect(() => Password.create("password123")).toThrow("Invalid password hash format");
    });

    it("should throw if hash has invalid prefix", () => {
      expect(() =>
        Password.create("$3a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO")
      ).toThrow("Invalid password hash format");
    });

    it("should throw if hash is too short", () => {
      expect(() => Password.create("$2a$12$tooshort")).toThrow("Invalid password hash format");
    });
  });

  describe("equals()", () => {
    it("should return true for two passwords with the same hash", () => {
      const a = Password.create(VALID_HASH);
      const b = Password.create(VALID_HASH);
      expect(a.equals(b)).toBe(true);
    });

    it("should return false for two different hashes", () => {
      const a = Password.create(VALID_HASH);
      const b = Password.create("$2b$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO");
      expect(a.equals(b)).toBe(false);
    });

    it("should return false when compared to null", () => {
      const password = Password.create(VALID_HASH);
      expect(password.equals(null as unknown as Password)).toBe(false);
    });

    it("should return false when compared to undefined", () => {
      const password = Password.create(VALID_HASH);
      expect(password.equals(undefined as unknown as Password)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("should return the hash string", () => {
      const password = Password.create(VALID_HASH);
      expect(password.toString()).toBe(VALID_HASH);
    });
  });
});
