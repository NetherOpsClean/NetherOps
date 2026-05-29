export interface ContainerConfig {
  serverId: string;
  name: string;
  image: string;
  gameMode: string;
  difficulty: string;
  port: number;
  memoryMb: number;

  motd: string;
  maxPlayers: number;
  pvpEnabled: boolean;
  cracked: boolean;

  version?: string;
  type?: string;
}

export interface ContainerInfo {
  containerId: string;
  status: "running" | "stopped" | "error";
}

export const CONTAINER_PROVIDER = Symbol("CONTAINER_PROVIDER");

export interface ContainerProvider {
  create(config: ContainerConfig): Promise<string>; // returns containerId
  start(containerId: string): Promise<void>;
  stop(containerId: string): Promise<void>;
  remove(containerId: string): Promise<void>;
  getInfo(containerId: string): Promise<ContainerInfo>;
}
