export interface ContainerConfig {
  serverId: string;
  name: string;
  version: string;
  type: string;
  port: number;
  memoryMb: number;
}

export interface ContainerInfo {
  containerId: string;
  status: "running" | "stopped" | "error";
}

export const CONTAINER_PROVIDER = Symbol("CONTAINER_PROVIDER");

export interface IContainerProvider {
  create(config: ContainerConfig): Promise<string>; // returns containerId
  start(containerId: string): Promise<void>;
  stop(containerId: string): Promise<void>;
  remove(containerId: string): Promise<void>;
  getInfo(containerId: string): Promise<ContainerInfo>;
}
