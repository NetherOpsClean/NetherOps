import { Role, UserRole } from "./user-role.vo.js";

describe("Role Value Object", () => {
  describe("create()", () => {
    it("should create a USER role by default when no value is provided", () => {
      const role = Role.create();
      expect(role.getValue()).toBe("USER");
    });

    it("should create a USER role when undefined is passed", () => {
      const role = Role.create(undefined);
      expect(role.getValue()).toBe("USER");
    });

    it("should create an ADMIN role", () => {
      const role = Role.create("ADMIN");
      expect(role.getValue()).toBe("ADMIN");
    });

    it("should create a GUEST role", () => {
      const role = Role.create("GUEST");
      expect(role.getValue()).toBe("GUEST");
    });

    it("should be case insensitive", () => {
      const role = Role.create("admin");
      expect(role.getValue()).toBe("ADMIN");
    });

    it("should throw if role is invalid", () => {
      expect(() => Role.create("SUPERADMIN")).toThrow("Invalid role: SUPERADMIN");
    });
  });

  describe("getValue()", () => {
    it("should return the string value of the role", () => {
      const role = Role.create("ADMIN");
      expect(role.getValue()).toBe(UserRole.Admin);
    });
  });
});
