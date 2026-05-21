import { Injectable } from "@nestjs/common";
import { Server } from "../../domain/entities/server.entity";
import { IServerRepository } from "../../domain/repositories/server.repository";

/**
 * Implementación en memoria — útil para desarrollo y demo.
 * Reemplazar por TypeOrmServerRepository cuando tengas base de datos.
 */
@Injectable()
export class InMemoryServerRepository implements IServerRepository {
  private readonly store = new Map<string, Server>();

  async findById(id: string): Promise<Server | null> {
    return this.store.get(id) ?? null;
  }

  async findAllByOwner(ownerId: string): Promise<Server[]> {
    return [...this.store.values()].filter((s) => s.getOwnerId() === ownerId);
  }

  async save(server: Server): Promise<void> {
    this.store.set(server.getId(), server);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
