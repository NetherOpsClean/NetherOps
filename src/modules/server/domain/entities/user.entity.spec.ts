import { User } from "./user.entity.js";
import { Role } from "../value-objects/user-role.vo.js";
import { Password } from "../value-objects/password-hash.vo.js";
import { ResourceQuota } from "../value-objects/resource-quota.vo.js";

const makeUser = (
  overrides?: Partial<{
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
  }>
): User => {
  return User.create(
    overrides?.id ?? "user-123",
    overrides?.name ?? "Hector Barrera",
    overrides?.email ?? "hector@netherops.com",
    Role.create(overrides?.role ?? "USER"),
    Password.create(
      overrides?.password ?? "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
    )
  );
};

describe("User entity", () => {
  // ─── create ───────────────────────────────────────────────────────────────

  describe("create()", () => {
    it("should create a user with the provided data", () => {
      const user = makeUser();
      expect(user.getId()).toBe("user-123");
      expect(user.getName()).toBe("Hector Barrera");
      expect(user.getEmail()).toBe("hector@netherops.com");
    });

    it("should assign default quota of 1024 MB", () => {
      const user = makeUser();
      expect(user.getQuota().getValue()).toBe(1024);
    });

    it("should throw if email is invalid", () => {
      expect(() => makeUser({ email: "invalid-email" })).toThrow("Invalid email");
    });

    it("should store the provided role", () => {
      const user = makeUser({ role: "ADMIN" });
      expect(user.getRole()).toBe("ADMIN");
    });
  });

  // ─── reconstitute ─────────────────────────────────────────────────────────

  describe("reconstitute()", () => {
    it("should restore a user with the given data", () => {
      const createdAt = new Date("2024-01-01");
      const user = User.reconstitute(
        "user-456",
        "Jane Doe",
        "jane@netherops.com",
        "ADMIN",
        2048,
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO",
        createdAt
      );
      expect(user.getId()).toBe("user-456");
      expect(user.getName()).toBe("Jane Doe");
      expect(user.getEmail()).toBe("jane@netherops.com");
      expect(user.getRole()).toBe("ADMIN");
      expect(user.getQuota().getValue()).toBe(2048);
    });
  });

  // ─── isAdmin ──────────────────────────────────────────────────────────────

  describe("isAdmin()", () => {
    it("should return true when role is ADMIN", () => {
      const user = makeUser({ role: "ADMIN" });
      expect(user.isAdmin()).toBe(true);
    });

    it("should return false when role is USER", () => {
      const user = makeUser({ role: "USER" });
      expect(user.isAdmin()).toBe(false);
    });
  });

  // ─── updateName ───────────────────────────────────────────────────────────

  describe("updateName()", () => {
    it("should update the name", () => {
      const user = makeUser({ name: "Old Name" });
      user.updateName("New Name");
      expect(user.getName()).toBe("New Name");
    });

    it("should throw if name is empty", () => {
      const user = makeUser();
      expect(() => user.updateName("")).toThrow("Name cannot be empty");
    });

    it("should throw if name is only whitespace", () => {
      const user = makeUser();
      expect(() => user.updateName("   ")).toThrow("Name cannot be empty");
    });
  });

  // ─── getPassword ──────────────────────────────────────────────────────────

  describe("getPassword()", () => {
    it("should return the password value object", () => {
      const user = makeUser({
        password: "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO",
      });
      expect(user.getPassword()).toBeInstanceOf(Password);
      expect(user.getPassword().toString()).toBe(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );
    });
  });

  // ─── getQuota ─────────────────────────────────────────────────────────────

  describe("getQuota()", () => {
    it("should return the resource quota value object", () => {
      const user = makeUser();
      expect(user.getQuota()).toBeInstanceOf(ResourceQuota);
      expect(user.getQuota().getValue()).toBe(1024);
    });
  });
});
