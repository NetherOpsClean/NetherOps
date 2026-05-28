import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";

import { UserRepository } from "../../../domain/repositories/user.repository.js";
import { User } from "../../../domain/entities/user.entity.js";

import { UserId } from "../../../domain/value-objects/id.vo.js";
import { Email } from "../../../domain/value-objects/email.vo.js";
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id as string },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });

    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany();

    return records.map((r) => this.toDomain(r));
  }

  async save(user: User): Promise<User> {
    await this.prisma.user.upsert({
      where: { id: user.getId() },

      update: {
        name: user.getName(),
      },

      create: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole(),
        memoryMb: user.getQuota().getValue(),
        password: user.getPassword().toString(),
      },
    });

    return user;
  }

  private toDomain(record: {
    id: string;
    name: string;
    email: string;
    role: string;
    memoryMb: number;
    password: string;
    createdAt: Date;
  }): User {
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
}
