import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { UserRepository } from "../../../domain/repositories/user.repository.js";
import { User } from "../../../domain/entities/user.entity.js";
import { UserId } from "../../../domain/value-objects/id.vo.js";
import { Email } from "../../../domain/value-objects/email.vo.js";
import { User as PrismaUser, UserRole } from "@prisma/client";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });

    if (!record) {
      return null;
    }
    return this.toDomain(record);
  }

  async findById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });
    if (!record) {
      return null;
    }
    return this.toDomain(record);
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany();
    return records.map((r) => this.toDomain(r));
  }
  async save(user: User): Promise<User> {
    const record = await this.prisma.user.upsert({
      where: { id: user.getId() },

      update: {
        name: user.getName(),
        role: user.getRole() as UserRole,
      },

      create: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole() as UserRole,
        memoryMb: user.getQuota().getValue(),
        password: user.getPassword().toString(),
      },
    });

    return this.toDomain(record);
  }

  private toDomain(record: PrismaUser): User {
    return User.reconstitute(
      record.id,
      record.name,
      record.email,
      record.role,
      record.memoryMb,
      record.password,
      record.createdAt
    );
  }

  async findManyByIds(ids: UserId[]): Promise<User[]> {
    if (!ids || ids.length === 0) {
      return [] as User[];
    }

    const prismaUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return prismaUsers.map((model) => this.mapToDomain(model));
  }

  private mapToDomain(prismaModel: PrismaUser): User {
    return User.reconstitute(
      prismaModel.id,
      prismaModel.name,
      prismaModel.email,
      prismaModel.role,
      prismaModel.memoryMb,
      prismaModel.password,
      prismaModel.createdAt
    );
  }
}
