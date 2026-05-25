export class ServerConfiguration {
  readonly maxPlayers: number;
  readonly gameMode: string;
  readonly difficulty: string;
  readonly pvpEnabled: boolean;
  readonly motd: string;
  readonly cracked: boolean;

  private constructor(
    maxPlayers: number,
    gameMode: string,
    difficulty: string,
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
    gameMode: string,
    difficulty: string,
    pvpEnabled: boolean,
    motd: string,
    cracked: boolean
  ): ServerConfiguration {
    return new ServerConfiguration(maxPlayers, gameMode, difficulty, pvpEnabled, motd, cracked);
  }
}
