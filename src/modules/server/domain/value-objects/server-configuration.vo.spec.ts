import { ServerConfiguration, GameMode, Difficulty } from "./server-configuration.vo.js";

// Usamos tu patrón favorito para no repetir parámetros en cada test
const makeConfig = (
  overrides?: Partial<{
    maxPlayers: number;
    gameMode: GameMode;
    difficulty: Difficulty;
    pvpEnabled: boolean;
    motd: string;
    cracked: boolean;
  }>
): ServerConfiguration => {
  return ServerConfiguration.create(
    overrides?.maxPlayers ?? 20,
    overrides?.gameMode ?? "SURVIVAL",
    overrides?.difficulty ?? "NORMAL",
    overrides?.pvpEnabled ?? true,
    overrides?.motd ?? "Welcome to NetherOps Server!",
    overrides?.cracked ?? false
  );
};

describe("ServerConfiguration Value Object", () => {
  describe("Creation and Business Rules", () => {
    it("should create a valid ServerConfiguration with default values", () => {
      const config = makeConfig();

      expect(config.maxPlayers).toBe(20);
      expect(config.gameMode).toBe("SURVIVAL");
      expect(config.difficulty).toBe("NORMAL");
      expect(config.pvpEnabled).toBe(true);
      expect(config.motd).toBe("Welcome to NetherOps Server!");
      expect(config.cracked).toBe(false);
    });

    it("should allow creating a config with specific custom values", () => {
      const config = makeConfig({
        gameMode: "CREATIVE",
        difficulty: "HARD",
        pvpEnabled: false,
      });

      expect(config.gameMode).toBe("CREATIVE");
      expect(config.difficulty).toBe("HARD");
      expect(config.pvpEnabled).toBe(false);
    });
  });

  describe("Validation of maxPlayers", () => {
    it("should throw an error if maxPlayers is zero", () => {
      expect(() => makeConfig({ maxPlayers: 0 })).toThrowError(
        "Max players must be a positive integer"
      );
    });

    it("should throw an error if maxPlayers is negative", () => {
      expect(() => makeConfig({ maxPlayers: -10 })).toThrowError(
        "Max players must be a positive integer"
      );
    });

    it("should throw an error if maxPlayers is a decimal number", () => {
      expect(() => makeConfig({ maxPlayers: 10.5 })).toThrowError(
        "Max players must be a positive integer"
      );
    });
  });

  describe("Validation of MOTD", () => {
    it("should throw an error if the MOTD exceeds the maximum allowed length", () => {
      const longMotd = "A".repeat(60);

      expect(() => makeConfig({ motd: longMotd })).toThrowError(
        "MOTD is too long for the server list"
      );
    });

    it("should allow an MOTD exactly at the maximum allowed length", () => {
      const exactlyLimitMotd = "A".repeat(59);

      const config = makeConfig({ motd: exactlyLimitMotd });
      expect(config.motd).toBe(exactlyLimitMotd);
    });
  });
});
