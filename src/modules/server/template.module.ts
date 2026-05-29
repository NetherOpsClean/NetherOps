import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/database/prisma/prisma.module.js";
import { TemplateController } from "./infrastructure/http/template.controller.js";
import { GetAllTemplatesUseCase } from "../server/domain/use-cases/get-all-templates.use-case.js";
import { TEMPLATE_REPOSITORY } from "./domain/repositories/template.repository.js";
import { PrismaTemplateRepository } from "./infrastructure/persistence/prisma/prisma-template.repository.js";

@Module({
  imports: [PrismaModule],
  controllers: [TemplateController],
  providers: [
    GetAllTemplatesUseCase,
    { provide: TEMPLATE_REPOSITORY, useClass: PrismaTemplateRepository },
  ],
})
export class TemplateModule {}
