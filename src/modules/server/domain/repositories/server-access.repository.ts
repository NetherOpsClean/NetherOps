import { ServerAccess } from "../entities/server-access.entity.js";

export const SERVER_ACCESS_REPOSITORY = Symbol("SERVER_ACCESS_REPOSITORY");

export interface ServerAccessRepository {
  save(access: ServerAccess): Promise<void>;
  findByServerAndUser(serverId: string, userId: string): Promise<ServerAccess | null>;
  findAllByUser(userId: string): Promise<ServerAccess[]>;
  findAllByServer(serverId: string): Promise<ServerAccess[]>;
  delete(serverId: string, userId: string): Promise<void>;
}
