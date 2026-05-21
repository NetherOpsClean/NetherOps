import { Server } from "../entities/server.entity";

export interface CreateServerOptions {
  id: string;
  name: string;
  version: string;
  type: Server["type"];
  port: number;
  memoryMb: number;
  ownerId: string;
}

export const SERVER_REPOSITORY = Symbol("SERVER_REPOSITORY");

export interface IServerRepository {
  findById(id: string): Promise<Server | null>;
  findAllByOwner(ownerId: string): Promise<Server[]>;
  save(server: Server): Promise<void>;
  delete(id: string): Promise<void>;
}
