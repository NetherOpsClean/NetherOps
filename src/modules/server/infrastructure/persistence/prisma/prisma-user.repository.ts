import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../domain/repositories/user.repository.js";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { User } from "../../../domain/entities/user.entity.js";
import { Email } from "../../../domain/value-objects/email.vo.js";
import { UserId } from "../../../domain/value-objects/id.vo.js";
import { Password } from "../../../domain/value-objects/password-hash.vo.js";
import { UserRole } from "@prisma/client";
import { Role } from "../../../domain/value-objects/user-role.vo.js";
import { User as PrismaUser } from "@prisma/client";
import { ResourceQuota } from "../../../domain/value-objects/resource-quota.vo.js";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }
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
        password: user.getPassword().toString(),
        role: user.getRole() as UserRole,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: PrismaUser): User {
    return new User(
      record.id,
      record.name,
      record.email,
      Role.create(record.role),
      ResourceQuota.create(1024),
      Password.create(record.password),
      record.createdAt
    );
  }
}
