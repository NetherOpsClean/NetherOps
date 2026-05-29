import { Email } from "./email.vo.js";

describe("Email Value Object", () => {
  describe("Creation and Business Rules", () => {
    it("should create a valid email", () => {
      const email = Email.create("hector@netherops.com");
      expect(email.value).toBe("hector@netherops.com");
    });

    it("should allow subdomains", () => {
      const email = Email.create("hector@mail.netherops.com");
      expect(email.value).toBe("hector@mail.netherops.com");
    });

    it("should allow special characters in local part", () => {
      const email = Email.create("hector.barrera+test@netherops.com");
      expect(email.value).toBe("hector.barrera+test@netherops.com");
    });
  });

  describe("Validation", () => {
    it("should throw if email has no @ symbol", () => {
      expect(() => Email.create("hectornetherops.com")).toThrow("Invalid email format");
    });

    it("should throw if email has no domain", () => {
      expect(() => Email.create("hector@")).toThrow("Invalid email format");
    });

    it("should throw if email has no local part", () => {
      expect(() => Email.create("@netherops.com")).toThrow("Invalid email format");
    });

    it("should throw if email has no TLD", () => {
      expect(() => Email.create("hector@netherops")).toThrow("Invalid email format");
    });

    it("should throw if email is empty", () => {
      expect(() => Email.create("")).toThrow("Invalid email format");
    });

    it("should throw if email has spaces", () => {
      expect(() => Email.create("hector barrera@netherops.com")).toThrow("Invalid email format");
    });
  });

  describe("equals()", () => {
    it("should return true for two emails with the same value", () => {
      const a = Email.create("hector@netherops.com");
      const b = Email.create("hector@netherops.com");
      expect(a.equals(b)).toBe(true);
    });

    it("should return false for two different emails", () => {
      const a = Email.create("hector@netherops.com");
      const b = Email.create("other@netherops.com");
      expect(a.equals(b)).toBe(false);
    });

    it("should return false when compared to null", () => {
      const email = Email.create("hector@netherops.com");
      expect(email.equals(null as unknown as Email)).toBe(false);
    });

    it("should return false when compared to undefined", () => {
      const email = Email.create("hector@netherops.com");
      expect(email.equals(undefined as unknown as Email)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("should return the email string value", () => {
      const email = Email.create("hector@netherops.com");
      expect(email.toString()).toBe("hector@netherops.com");
    });
  });
});
