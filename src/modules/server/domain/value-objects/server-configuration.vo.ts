import { GameMode, Difficulty } from "./configuration.enum.js";

export class ServerConfiguration {
  readonly maxPlayers: number;
  readonly gameMode: GameMode;
  readonly difficulty: Difficulty;
  readonly pvpEnabled: boolean;
  readonly motd: string;
  readonly cracked: boolean;

  private constructor(
    maxPlayers: number,
    gameMode: GameMode,
    difficulty: Difficulty,
    pvpEnabled: boolean,
    motd: string,
    cracked: boolean
  ) {
    this.maxPlayers = maxPlayers;
    this.gameMode = gameMode;
    this.difficulty = difficulty;
    this.pvpEnabled = pvpEnabled;
    this.motd = motd;
    this.cracked = cracked;
  }

  static create(
    maxPlayers: number,
    gameMode: GameMode,
    difficulty: Difficulty,
    pvpEnabled: boolean,
    motd: string,
    cracked: boolean
  ): ServerConfiguration {
    if (!Number.isInteger(maxPlayers) || maxPlayers <= 0) {
      throw new Error("Max players must be a positive integer");
    }
    if (motd.length > 59) {
      throw new Error("MOTD is too long for the server list");
    }
    return new ServerConfiguration(maxPlayers, gameMode, difficulty, pvpEnabled, motd, cracked);
  }
}
