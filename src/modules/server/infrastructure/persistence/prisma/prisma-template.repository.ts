import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import type {
  TemplateRepository,
  TemplateRecord,
} from "../../../domain/repositories/template.repository.js";

@Injectable()
export class PrismaTemplateRepository implements TemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TemplateRecord[]> {
    return this.prisma.template.findMany({
      orderBy: { alias: "asc" },
    });
  }

  async findById(id: string): Promise<TemplateRecord | null> {
    return this.prisma.template.findUnique({
      where: { id },
    });
  }
}
