export class CreateServerDto {
  name: string;
  ownerId: string;
  nodeId: string;
  templateId: string;
  memoryLimitMb: number;
  diskLimitMb: number;
  configuration: {
    maxPlayers: number;
    gameMode: string;
    difficulty: string;
    pvpEnabled: boolean;
    motd: string;
    cracked: boolean;
  };

  constructor(
    name: string,
    ownerId: string,
    nodeId: string,
    templateId: string,
    memoryLimitMb: number,
    diskLimitMb: number,
    maxPlayers: number,
    gameMode: string,
    difficulty: string,
    pvpEnabled: boolean,
    motd: string,
    cracked: boolean
  ) {
    this.name = name;
    this.ownerId = ownerId;
    this.nodeId = nodeId;
    this.templateId = templateId;
    this.memoryLimitMb = memoryLimitMb;
    this.diskLimitMb = diskLimitMb;
    this.configuration = {
      maxPlayers: maxPlayers,
      gameMode: gameMode,
      difficulty: difficulty,
      pvpEnabled: pvpEnabled,
      motd: motd,
      cracked: cracked,
    };
  }
}
